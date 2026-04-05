import { mkdirSync, rmSync, readdirSync, copyFileSync, cpSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = resolve(__dirname, "../../../packages/termcss/dist");
const pub = resolve(__dirname, "../public");
const themesOut = resolve(pub, "themes");

rmSync(themesOut, { recursive: true, force: true });
mkdirSync(themesOut, { recursive: true });

for (const file of readdirSync(resolve(dist, "themes"))) {
  if (file.endsWith(".css")) {
    copyFileSync(resolve(dist, "themes", file), resolve(themesOut, file));
  }
}

// Copy base CSS and fonts for iframe usage (playground)
copyFileSync(resolve(dist, "term.min.css"), resolve(pub, "term.min.css"));
const fontsOut = resolve(pub, "fonts");
rmSync(fontsOut, { recursive: true, force: true });
cpSync(resolve(dist, "fonts"), fontsOut, { recursive: true });
