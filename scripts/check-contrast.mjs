import { readdirSync, readFileSync } from "fs";
import { resolve, dirname, basename } from "path";
import { fileURLToPath } from "url";
import { oklchToLuminance, contrastRatio } from "../packages/termcss/scripts/color.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const themesDir = resolve(__dirname, "../packages/termcss/src/themes");

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

// All text colors checked at 4.5:1 (AA normal text)
const checks = [
  { label: "fg/bg", a: "fg", b: "bg", min: 4.5 },
  { label: "muted/bg", a: "muted", b: "bg", min: 4.5 },
  { label: "accent/bg", a: "accent", b: "bg", min: 4.5 },
  { label: "red/bg", a: "red", b: "bg", min: 4.5 },
  { label: "yellow/bg", a: "yellow", b: "bg", min: 4.5 },
  { label: "green/bg", a: "green", b: "bg", min: 4.5 },
];

let failed = false;
const themeFiles = readdirSync(themesDir).filter((f) => f.endsWith(".css")).sort();

for (const file of themeFiles) {
  const name = basename(file, ".css");
  const css = readFileSync(resolve(themesDir, file), "utf-8");
  const vars = parseTheme(css);

  if (!vars.bg || !vars.fg || !vars.muted || !vars.accent) {
    console.error(`FAIL: ${name} - missing required variables (bg, fg, muted, accent)`);
    failed = true;
    continue;
  }

  const failures = [];

  for (const mode of ["light", "dark"]) {
    for (const { label, a, b, min } of checks) {
      if (!vars[a] || !vars[b]) continue;
      const Ya = oklchToLuminance(vars[a][mode].L, vars[a][mode].C, vars[a][mode].H);
      const Yb = oklchToLuminance(vars[b][mode].L, vars[b][mode].C, vars[b][mode].H);
      const ratio = contrastRatio(Ya, Yb);
      if (ratio < min) {
        failures.push(`  ${mode} ${label}: ${ratio.toFixed(2)}:1 (need ${min}:1)`);
      }
    }
  }

  if (failures.length) {
    console.error(`FAIL: ${name}`);
    for (const f of failures) console.error(f);
    failed = true;
  } else {
    console.log(`  OK: ${name}`);
  }
}

if (failed) {
  console.error("\nContrast check FAILED - some themes do not meet WCAG AA thresholds.");
  process.exitCode = 1;
} else {
  console.log("\nAll themes pass WCAG AA contrast checks.");
}
