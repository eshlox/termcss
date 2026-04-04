import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, unlinkSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const generatorPath = resolve(__dirname, "../packages/term.css/scripts/generate-theme.js");
const playgroundPath = resolve(__dirname, "../apps/docs/src/pages/playground.astro");
const outPath = resolve(__dirname, "../.tmp-parity-test.css");

const playgroundSrc = readFileSync(playgroundPath, "utf-8");

function generateTheme() {
  execFileSync("node", [generatorPath, "--hue", "200", "--name", "parity-test", "--chroma", "0.15", "--out", outPath], {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  return readFileSync(outPath, "utf-8");
}

// Extract --t-* variable names from CSS
function extractVarNames(css) {
  const matches = css.matchAll(/--t-([a-z0-9-]+)\s*:/g);
  return [...new Set([...matches].map((m) => m[1]))].sort();
}

// Extract syntax hue offsets from JS/TS source via regex
function extractSyntaxOffsets(src) {
  const offsets = {};
  for (const m of src.matchAll(/(\w+):\s*\(hue \+ (\d+)\) % 360/g)) {
    offsets[m[1]] = parseInt(m[2]);
  }
  // comment uses bare hue (offset 0)
  if (/comment:\s+hue[,\n]/.test(src)) offsets.comment = 0;
  return offsets;
}

describe("playground/generator parity", () => {
  after(() => {
    if (existsSync(outPath)) unlinkSync(outPath);
  });

  it("CLI generator emits the canonical variable set", () => {
    const cliCSS = generateTheme();
    const cliVars = extractVarNames(cliCSS);

    // The canonical set every theme must define
    const expected = [
      "bg", "fg", "muted", "accent", "accent2", "surface", "border",
      "red", "yellow", "green",
      "syntax-keyword", "syntax-string", "syntax-comment", "syntax-function",
      "syntax-number", "syntax-operator", "syntax-type", "syntax-punctuation",
    ].sort();

    assert.deepStrictEqual(cliVars, expected, "CLI generator should emit canonical variable set");
  });

  it("playground constructs the same variable names via its key sets", () => {
    const generatorSrc = readFileSync(generatorPath, "utf-8");

    // Base vars come from Object.keys(light) in both files
    function extractBaseKeys(src) {
      const block = src.match(/const light\s*=\s*\{([^}]+)\}/);
      return [...block[1].matchAll(/^\s*(\w+)\s*:/gm)].map((m) => m[1]).sort();
    }

    // Syntax vars come from syntaxHues keys + punctuation
    function extractSyntaxKeys(src) {
      const keys = [...src.matchAll(/(\w+):\s*\(?hue/g)].map((m) => m[1]);
      if (src.includes("syntax-punctuation")) keys.push("punctuation");
      return keys.sort();
    }

    const genBase = extractBaseKeys(generatorSrc);
    const pgBase = extractBaseKeys(playgroundSrc);
    assert.deepStrictEqual(pgBase, genBase, "base keys must match");

    const genSyntax = extractSyntaxKeys(generatorSrc);
    const pgSyntax = extractSyntaxKeys(playgroundSrc);
    assert.deepStrictEqual(pgSyntax, genSyntax, "syntax keys must match");
  });

  it("syntax hue rotation offsets match between generator and playground", () => {
    const generatorSrc = readFileSync(generatorPath, "utf-8");
    const genOffsets = extractSyntaxOffsets(generatorSrc);
    const pgOffsets = extractSyntaxOffsets(playgroundSrc);

    assert.deepStrictEqual(pgOffsets, genOffsets, "hue rotation offsets must match");
  });

  it("syntax lightness values match", () => {
    // Generator calls generateLightDark with lightSyntaxL=0.45, darkSyntaxL=0.75
    const generatorSrc = readFileSync(generatorPath, "utf-8");
    assert.ok(generatorSrc.includes("0.45, 0.75"), "generator should use syntax L=0.45/0.75");

    // Playground uses the same lightness in its export
    assert.ok(playgroundSrc.includes("oklch(0.45, chroma"), "playground light syntax should use L=0.45");
    assert.ok(playgroundSrc.includes("oklch(0.75, chroma"), "playground dark syntax should use L=0.75");
  });

  it("base variable keys match between generator and playground", () => {
    const generatorSrc = readFileSync(generatorPath, "utf-8");

    // Extract keys from the light = { ... } objects in both files
    function extractBaseKeys(src) {
      const block = src.match(/const light\s*=\s*\{([^}]+)\}/);
      if (!block) return [];
      return [...block[1].matchAll(/^\s*(\w+)\s*:/gm)].map((m) => m[1]).sort();
    }

    const genKeys = extractBaseKeys(generatorSrc);
    const pgKeys = extractBaseKeys(playgroundSrc);
    assert.deepStrictEqual(pgKeys, genKeys, "base variable keys must match");
  });

  it("semantic color values match between generator and playground", () => {
    const generatorSrc = readFileSync(generatorPath, "utf-8");

    // Both should use the same fixed semantic OKLCH values
    const semanticValues = [
      "0.55 0.20 25",  // red light
      "0.65 0.20 25",  // red dark
      "0.55 0.16 85",  // yellow light
      "0.78 0.16 85",  // yellow dark
      "0.50 0.17 145", // green light
      "0.72 0.19 145", // green dark
    ];

    for (const v of semanticValues) {
      assert.ok(generatorSrc.includes(v), `generator should include semantic value ${v}`);
      // Playground uses comma-separated args: oklch(L, C, H)
      const [L, C, H] = v.split(" ");
      assert.ok(
        playgroundSrc.includes(`L: ${L}`) && playgroundSrc.includes(`C: ${C}`) && playgroundSrc.includes(`H: ${H}`),
        `playground should include semantic value ${v}`,
      );
    }
  });
});
