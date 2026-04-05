import { bundleAsync } from "lightningcss";
import { writeFileSync, mkdirSync, readdirSync, rmSync } from "fs";
import { resolve, basename, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const themesDir = resolve(root, "src/themes");
const outDir = resolve(root, "dist/themes");

async function buildTheme(file) {
  const input = resolve(themesDir, file);
  const name = basename(file, ".css");

  const { code: full } = await bundleAsync({
    filename: input,
    minify: false,
    sourceMap: false,
    targets: { chrome: 123 << 16, firefox: 121 << 16, safari: 18 << 16 },
  });
  writeFileSync(resolve(outDir, `${name}.css`), full);

  const { code: min } = await bundleAsync({
    filename: input,
    minify: true,
    sourceMap: false,
    targets: { chrome: 123 << 16, firefox: 121 << 16, safari: 18 << 16 },
  });
  writeFileSync(resolve(outDir, `${name}.min.css`), min);

  console.log(`Built themes/${name}.css (${full.length}B / ${min.length}B min)`);
}

async function build() {
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const files = readdirSync(themesDir).filter((f) => f.endsWith(".css"));
  for (const file of files) {
    await buildTheme(file);
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
