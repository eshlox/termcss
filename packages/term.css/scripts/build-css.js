import { bundleAsync } from "lightningcss";
import { writeFileSync, mkdirSync, cpSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

async function build() {
  const input = resolve(root, "src/term.css");
  const outDir = resolve(root, "dist");
  mkdirSync(outDir, { recursive: true });

  cpSync(resolve(root, "src/fonts"), resolve(outDir, "fonts"), { recursive: true });

  // Unminified
  const { code: full } = await bundleAsync({
    filename: input,
    minify: false,
    sourceMap: false,
    targets: { chrome: 123 << 16, firefox: 121 << 16, safari: 18 << 16 },
    drafts: { customMedia: true },
  });
  writeFileSync(resolve(outDir, "term.css"), full);

  // Minified
  const { code: min } = await bundleAsync({
    filename: input,
    minify: true,
    sourceMap: false,
    targets: { chrome: 123 << 16, firefox: 121 << 16, safari: 18 << 16 },
    drafts: { customMedia: true },
  });
  writeFileSync(resolve(outDir, "term.min.css"), min);

  console.log(
    `Built dist/term.css (${full.length}B) and dist/term.min.css (${min.length}B)`
  );
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
