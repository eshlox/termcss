import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { oklchToLuminance, contrastRatio } from "../packages/term.css/scripts/color.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const themesDir = resolve(__dirname, "../packages/term.css/src/themes");

function parseTheme(css) {
  const vars = {};
  const re =
    /--t-(bg|fg|muted|accent|accent2|red|yellow|green)\s*:\s*light-dark\(\s*oklch\(([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\)\s*,\s*oklch\(([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\)\s*\)/g;
  let match;
  while ((match = re.exec(css))) {
    if (!vars[match[1]]) {
      vars[match[1]] = {
        light: { L: parseFloat(match[2]), C: parseFloat(match[3]), H: parseFloat(match[4]) },
        dark: { L: parseFloat(match[5]), C: parseFloat(match[6]), H: parseFloat(match[7]) },
      };
    }
  }
  return vars;
}

describe("theme parser", () => {
  it("parses all required variables from a theme file", () => {
    const css = readFileSync(resolve(themesDir, "default.css"), "utf-8");
    const vars = parseTheme(css);
    const required = ["bg", "fg", "muted", "accent", "accent2", "red", "yellow", "green"];
    for (const key of required) {
      assert.ok(vars[key], `should parse --t-${key}`);
      assert.ok(typeof vars[key].light.L === "number", `--t-${key} light L should be a number`);
      assert.ok(typeof vars[key].dark.L === "number", `--t-${key} dark L should be a number`);
    }
  });

  it("does not confuse --t-accent with --t-accent2", () => {
    const css = `
      --t-accent: light-dark(oklch(0.50 0.17 255), oklch(0.63 0.21 255));
      --t-accent2: light-dark(oklch(0.99 0.19 312), oklch(0.66 0.23 312));
    `;
    const vars = parseTheme(css);
    assert.equal(vars.accent.light.L, 0.50);
    assert.equal(vars.accent2.light.L, 0.99);
  });

  it("parses L, C, and H for both modes", () => {
    const css = `--t-bg: light-dark(oklch(0.97 0.01 200), oklch(0.15 0.02 200));`;
    const vars = parseTheme(css);
    assert.deepStrictEqual(vars.bg.light, { L: 0.97, C: 0.01, H: 200 });
    assert.deepStrictEqual(vars.bg.dark, { L: 0.15, C: 0.02, H: 200 });
  });
});

describe("all shipped themes pass WCAG AA", () => {
  const checks = [
    { label: "fg/bg", a: "fg", b: "bg", min: 4.5 },
    { label: "muted/bg", a: "muted", b: "bg", min: 4.5 },
    { label: "accent/bg", a: "accent", b: "bg", min: 4.5 },
    { label: "red/bg", a: "red", b: "bg", min: 4.5 },
    { label: "yellow/bg", a: "yellow", b: "bg", min: 4.5 },
    { label: "green/bg", a: "green", b: "bg", min: 4.5 },
  ];

  const themeFiles = readdirSync(themesDir).filter((f) => f.endsWith(".css")).sort();

  for (const file of themeFiles) {
    const name = basename(file, ".css");

    it(`${name}: all contrast pairs pass`, () => {
      const css = readFileSync(resolve(themesDir, file), "utf-8");
      const vars = parseTheme(css);
      assert.ok(vars.bg, "theme must define --t-bg");

      for (const mode of ["light", "dark"]) {
        for (const { label, a, b, min } of checks) {
          if (!vars[a] || !vars[b]) continue;
          const Ya = oklchToLuminance(vars[a][mode].L, vars[a][mode].C, vars[a][mode].H);
          const Yb = oklchToLuminance(vars[b][mode].L, vars[b][mode].C, vars[b][mode].H);
          const ratio = contrastRatio(Ya, Yb);
          assert.ok(
            ratio >= min,
            `${mode} ${label}: ${ratio.toFixed(2)}:1 < ${min}:1`,
          );
        }
      }
    });
  }
});
