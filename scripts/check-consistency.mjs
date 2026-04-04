import { readdirSync, readFileSync } from "fs";
import { resolve, dirname, basename } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

let failed = false;
function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failed = true;
}

// 1. Theme data matches source files
const themesDir = resolve(root, "packages/term.css/src/themes");
const themeFiles = readdirSync(themesDir)
  .filter((f) => f.endsWith(".css"))
  .map((f) => basename(f, ".css"));

const dataFile = resolve(root, "apps/docs/src/data/themes.ts");
const dataContent = readFileSync(dataFile, "utf-8");
const dataNames = [...dataContent.matchAll(/name: "([^"]+)"/g)].map((m) => m[1]);

const missingInData = themeFiles.filter((t) => !dataNames.includes(t));
const extraInData = dataNames.filter((t) => !themeFiles.includes(t));

if (missingInData.length) fail(`themes in src/ but missing from docs data: ${missingInData.join(", ")}`);
if (extraInData.length) fail(`themes in docs data but missing from src/: ${extraInData.join(", ")}`);

// 2. No phantom t-* classes in docs
const componentsCSS = readFileSync(
  resolve(root, "packages/term.css/src/components.css"),
  "utf-8",
);
const realClasses = [...componentsCSS.matchAll(/\.(t-[\w-]+)/g)].map((m) => m[1]);

const docsSrc = resolve(root, "apps/docs/src");
const astroFiles = readdirSync(docsSrc, { recursive: true }).filter((f) => f.endsWith(".astro"));

for (const file of astroFiles) {
  const content = readFileSync(resolve(docsSrc, file), "utf-8");
  const classAttrs = [...content.matchAll(/class="([^"]*)"/g)].map((m) => m[1]);
  const usedClasses = classAttrs.flatMap((attr) =>
    [...attr.matchAll(/\bt-[\w-]+/g)].map((m) => m[0]),
  );
  const phantoms = [...new Set(usedClasses.filter((c) => !realClasses.includes(c)))];
  if (phantoms.length) fail(`${file} uses undefined classes: ${phantoms.join(", ")}`);
}

// 3. No nested directories in public/themes
const publicThemes = resolve(root, "apps/docs/public/themes");
try {
  const entries = readdirSync(publicThemes, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory());
  if (dirs.length) fail(`nested directories in public/themes/: ${dirs.map((d) => d.name).join(", ")}`);
} catch {
  // public/themes may not exist yet
}

// 4. README theme references match source
const readme = readFileSync(resolve(root, "README.md"), "utf-8");

const readmeCountMatch = readme.match(/\*\*(\d+) themes\*\*/);
if (readmeCountMatch) {
  const readmeCount = parseInt(readmeCountMatch[1]);
  if (readmeCount !== themeFiles.length) {
    fail(`README claims ${readmeCount} themes but ${themeFiles.length} exist in src/`);
  }
}

const availableMatch = readme.match(/^Available:(.+)$/m);
if (availableMatch) {
  const readmeThemeNames = [...availableMatch[1].matchAll(/`([^`]+)`/g)].map((m) => m[1]);
  const missingInReadme = themeFiles.filter((t) => t !== "default" && !readmeThemeNames.includes(t));
  const extraInReadme = readmeThemeNames.filter((t) => !themeFiles.includes(t));
  if (missingInReadme.length) fail(`themes in src/ but missing from README: ${missingInReadme.join(", ")}`);
  if (extraInReadme.length) fail(`themes in README but missing from src/: ${extraInReadme.join(", ")}`);
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log("OK: all consistency checks passed");
}
