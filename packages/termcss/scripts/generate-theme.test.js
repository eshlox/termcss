import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, unlinkSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const generator = resolve(__dirname, "generate-theme.js");
const outPath = resolve(__dirname, "../../../.tmp-test-theme.css");

function generate(args) {
  return execFileSync("node", [generator, ...args], {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  });
}

describe("theme generator", () => {
  after(() => {
    if (existsSync(outPath)) unlinkSync(outPath);
  });

  it("generates a valid theme file", () => {
    generate(["--hue", "200", "--name", "test-gen", "--out", outPath]);
    const css = readFileSync(outPath, "utf-8");

    // Has the theme header comment
    assert.ok(css.includes("/* test-gen"), "should include theme name");
    assert.ok(css.includes("Hue: 200"), "should include hue");

    // Has required structure
    assert.ok(css.includes("color-scheme: light dark"), "should set color-scheme");
    assert.ok(css.includes(':root[data-theme="light"]'), "should have light override");
    assert.ok(css.includes(':root[data-theme="dark"]'), "should have dark override");
  });

  it("generates all 10 base variables", () => {
    generate(["--hue", "100", "--name", "test-vars", "--out", outPath]);
    const css = readFileSync(outPath, "utf-8");

    const required = [
      "--t-bg", "--t-fg", "--t-muted", "--t-accent", "--t-accent2",
      "--t-surface", "--t-border", "--t-red", "--t-yellow", "--t-green",
    ];
    for (const v of required) {
      assert.ok(css.includes(v), `should include ${v}`);
    }
  });

  it("generates syntax variables", () => {
    generate(["--hue", "100", "--name", "test-syntax", "--out", outPath]);
    const css = readFileSync(outPath, "utf-8");

    const syntaxVars = [
      "--t-syntax-keyword", "--t-syntax-string", "--t-syntax-comment",
      "--t-syntax-function", "--t-syntax-number", "--t-syntax-operator",
      "--t-syntax-type", "--t-syntax-punctuation",
    ];
    for (const v of syntaxVars) {
      assert.ok(css.includes(v), `should include ${v}`);
    }
  });

  it("uses light-dark() for all color variables", () => {
    generate(["--hue", "50", "--name", "test-ld", "--out", outPath]);
    const css = readFileSync(outPath, "utf-8");
    const varLines = css.split("\n").filter((l) => l.includes("--t-") && !l.includes("var("));
    for (const line of varLines) {
      assert.ok(line.includes("light-dark("), `should use light-dark(): ${line.trim()}`);
    }
  });

  it("uses oklch() format for all colors", () => {
    generate(["--hue", "300", "--name", "test-oklch", "--out", outPath]);
    const css = readFileSync(outPath, "utf-8");
    const colorMatches = css.match(/oklch\([0-9.]+\s+[0-9.]+\s+[0-9.]+\)/g);
    assert.ok(colorMatches && colorMatches.length > 0, "should contain oklch() values");
    // Each variable has 2 oklch values (light + dark), 17 variables = 34
    // (10 base + 7 syntax with oklch, punctuation uses var())
    assert.ok(colorMatches.length >= 34, `expected >= 34 oklch values, got ${colorMatches.length}`);
  });

  it("respects --chroma parameter", () => {
    generate(["--hue", "200", "--name", "test-chroma", "--chroma", "0.25", "--out", outPath]);
    const css = readFileSync(outPath, "utf-8");
    assert.ok(css.includes("Chroma: 0.25"), "should reflect custom chroma in comment");
    assert.ok(css.includes("0.25"), "should contain chroma value in colors");
  });

  it("fails with missing required arguments", () => {
    assert.throws(
      () => generate(["--hue", "200"]),
      /Missing|Usage/i,
      "should fail without --name",
    );
    assert.throws(
      () => generate(["--name", "test"]),
      /Missing|Usage/i,
      "should fail without --hue",
    );
  });

  it("validates hue range", () => {
    assert.throws(
      () => generate(["--hue", "400", "--name", "test", "--out", outPath]),
      /hue/i,
    );
    assert.throws(
      () => generate(["--hue", "-10", "--name", "test", "--out", outPath]),
      /hue/i,
    );
  });

  it("validates name format", () => {
    assert.throws(
      () => generate(["--hue", "200", "--name", "Bad Name!", "--out", outPath]),
      /name/i,
    );
  });
});
