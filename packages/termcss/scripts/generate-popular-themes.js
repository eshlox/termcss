#!/usr/bin/env node
// One-time script to generate 12 popular terminal theme CSS files
// Can be deleted after use - the generated CSS files are the artifacts

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Color conversion: hex → OKLCH ---

function hexToLinear(hex) {
  hex = hex.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const lin = (c) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return [lin(r), lin(g), lin(b)];
}

function linearToOklch(rgb) {
  const [r, g, b] = rgb;
  // sRGB linear → XYZ D65
  const x = 0.4124564 * r + 0.3575761 * g + 0.1804375 * b;
  const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  const z = 0.0193339 * r + 0.119192 * g + 0.9503041 * b;
  // XYZ → LMS
  const l = 0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z;
  const m = 0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z;
  const s = 0.0482003018 * x + 0.2643662691 * y + 0.633851707 * z;
  // LMS → cube root
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  // → OKLab
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const ob = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  // → OKLCH
  const C = Math.sqrt(a * a + ob * ob);
  let H = (Math.atan2(ob, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return [L, C, H];
}

function oklch(hex) {
  const [r, g, b] = hexToLinear(hex);
  let [L, C, H] = linearToOklch([r, g, b]);
  L = Math.round(L * 100) / 100;
  C = Math.round(C * 100) / 100;
  H = Math.round(H);
  if (C < 0.01) return `oklch(${L.toFixed(2)} 0 0)`;
  return `oklch(${L.toFixed(2)} ${C.toFixed(2)} ${H})`;
}

// --- Theme data ---
// Each array: [bg, fg, muted, accent, accent2, surface, border, red, yellow, green,
//              syn-keyword, syn-string, syn-comment, syn-function, syn-number, syn-operator, syn-type, syn-punctuation]

const themes = [
  {
    name: "dracula",
    label: "Dracula",
    d: ["#282a36","#f8f8f2","#6272a4","#bd93f9","#ff79c6","#44475a","#44475a","#ff5555","#f1fa8c","#50fa7b",
        "#ff79c6","#f1fa8c","#6272a4","#50fa7b","#bd93f9","#ff79c6","#8be9fd","#f8f8f2"],
    l: ["#f8f8f2","#282a36","#6272a4","#7c3aed","#be185d","#f0eff3","#d5d4d8","#dc2626","#856d00","#2b6e3f",
        "#be185d","#856d00","#6272a4","#2b6e3f","#7c3aed","#be185d","#0e7490","#282a36"],
  },
  {
    name: "nord",
    label: "Nord",
    d: ["#2e3440","#d8dee9","#4c566a","#88c0d0","#81a1c1","#3b4252","#434c5e","#bf616a","#ebcb8b","#a3be8c",
        "#81a1c1","#a3be8c","#4c566a","#88c0d0","#b48ead","#81a1c1","#8fbcbb","#d8dee9"],
    l: ["#eceff4","#2e3440","#4c566a","#5e81ac","#b48ead","#e5e9f0","#d8dee9","#bf616a","#bf8c09","#5a8a4a",
        "#5e81ac","#8aad6a","#4c566a","#5e81ac","#b48ead","#5e81ac","#8fbcbb","#2e3440"],
  },
  {
    name: "solarized",
    label: "Solarized",
    d: ["#002b36","#839496","#586e75","#268bd2","#2aa198","#073642","#073642","#dc322f","#b58900","#859900",
        "#859900","#2aa198","#586e75","#268bd2","#d33682","#859900","#b58900","#839496"],
    l: ["#fdf6e3","#657b83","#93a1a1","#268bd2","#2aa198","#eee8d5","#eee8d5","#dc322f","#b58900","#859900",
        "#859900","#2aa198","#93a1a1","#268bd2","#d33682","#859900","#b58900","#657b83"],
  },
  {
    name: "one-dark",
    label: "One Dark",
    d: ["#282c34","#abb2bf","#5c6370","#61afef","#c678dd","#2c313c","#4b5263","#e06c75","#e5c07b","#98c379",
        "#c678dd","#98c379","#5c6370","#61afef","#d19a66","#56b6c2","#e5c07b","#abb2bf"],
    l: ["#fafafa","#383a42","#a0a1a7","#4078f2","#a626a4","#f0f0f0","#dcdcdc","#e45649","#986801","#50a14f",
        "#a626a4","#50a14f","#a0a1a7","#4078f2","#986801","#0184bc","#c18401","#383a42"],
  },
  {
    name: "monokai",
    label: "Monokai",
    d: ["#2d2a2e","#fcfcfa","#727072","#ffd866","#78dce8","#403e41","#5b595c","#ff6188","#ffd866","#a9dc76",
        "#ff6188","#ffd866","#727072","#a9dc76","#ab9df2","#ff6188","#78dce8","#fcfcfa"],
    l: ["#faf4f2","#29242a","#918c8e","#cc7a0a","#1c8ca8","#ede7e5","#bfb9ba","#e14775","#8a6200","#4d8a1a",
        "#e14775","#8a6200","#918c8e","#4d8a1a","#7852bf","#e14775","#1c8ca8","#29242a"],
  },
  {
    name: "tokyo-night",
    label: "Tokyo Night",
    d: ["#1a1b26","#a9b1d6","#51597d","#7aa2f7","#bb9af7","#1e202e","#292e42","#f7768e","#e0af68","#9ece6a",
        "#bb9af7","#9ece6a","#565f89","#7aa2f7","#ff9e64","#89ddff","#2ac3de","#a9b1d6"],
    l: ["#e1e2e7","#343b59","#848694","#2959aa","#7847bd","#d5d6db","#c4c5cb","#8c4351","#8f5e15","#485e30",
        "#5a3e8e","#485e30","#888b94","#2959aa","#965027","#006c86","#166775","#343b59"],
  },
  {
    name: "catppuccin",
    label: "Catppuccin",
    d: ["#1e1e2e","#cdd6f4","#6c7086","#89b4fa","#cba6f7","#313244","#45475a","#f38ba8","#f9e2af","#a6e3a1",
        "#cba6f7","#a6e3a1","#6c7086","#89b4fa","#fab387","#89dceb","#f9e2af","#cdd6f4"],
    l: ["#eff1f5","#4c4f69","#9ca0b0","#1e66f5","#8839ef","#ccd0da","#bcc0cc","#d20f39","#df8e1d","#40a02b",
        "#8839ef","#40a02b","#9ca0b0","#1e66f5","#fe640b","#179299","#df8e1d","#4c4f69"],
  },
  {
    name: "rose-pine",
    label: "Rosé Pine",
    d: ["#191724","#e0def4","#6e6a86","#c4a7e7","#9ccfd8","#1f1d2e","#26233a","#eb6f92","#f6c177","#31748f",
        "#31748f","#ebbcba","#6e6a86","#c4a7e7","#ea9a97","#9ccfd8","#f6c177","#e0def4"],
    l: ["#faf4ed","#575279","#9893a5","#907aa9","#56949f","#fffaf3","#f2e9e1","#b4637a","#ea9d34","#286983",
        "#286983","#d7827e","#9893a5","#907aa9","#d7827e","#56949f","#ea9d34","#575279"],
  },
  {
    name: "gruvbox",
    label: "Gruvbox",
    d: ["#282828","#ebdbb2","#928374","#fabd2f","#83a598","#3c3836","#504945","#fb4934","#fabd2f","#b8bb26",
        "#fb4934","#b8bb26","#928374","#fabd2f","#d3869b","#fe8019","#83a598","#ebdbb2"],
    l: ["#fbf1c7","#3c3836","#928374","#b57614","#076678","#ebdbb2","#d5c4a1","#9d0006","#b57614","#79740e",
        "#9d0006","#79740e","#928374","#b57614","#8f3f71","#af3a03","#076678","#3c3836"],
  },
  {
    name: "everforest",
    label: "Everforest",
    d: ["#272e33","#d3c6aa","#7a8478","#a7c080","#7fbbb3","#2e383c","#374145","#e67e80","#dbbc7f","#a7c080",
        "#e67e80","#a7c080","#7a8478","#7fbbb3","#d699b6","#e69875","#dbbc7f","#d3c6aa"],
    l: ["#fdf6e3","#5c6a72","#a6b0a0","#8da101","#3a94c5","#f3efda","#e0dcc7","#f85552","#dfa000","#8da101",
        "#f85552","#8da101","#a6b0a0","#3a94c5","#df69ba","#f57d26","#dfa000","#5c6a72"],
  },
  {
    name: "github",
    label: "GitHub",
    d: ["#0d1117","#e6edf3","#8b949e","#58a6ff","#bc8cff","#161b22","#30363d","#f85149","#e3b341","#3fb950",
        "#ff7b72","#a5d6ff","#8b949e","#d2a8ff","#79c0ff","#ff7b72","#ffa657","#e6edf3"],
    l: ["#ffffff","#1f2328","#656d76","#0969da","#8250df","#f6f8fa","#d0d7de","#d1242f","#953800","#1a7f37",
        "#cf222e","#0a3069","#656d76","#8250df","#0550ae","#cf222e","#953800","#1f2328"],
  },
  {
    name: "kanagawa",
    label: "Kanagawa",
    d: ["#1f1f28","#dcd7ba","#727169","#7e9cd8","#957fb8","#2a2a37","#363646","#e82424","#c0a36e","#98bb6c",
        "#957fb8","#98bb6c","#727169","#7e9cd8","#d27e99","#c0a36e","#7aa89f","#dcd7ba"],
    l: ["#f2ecbc","#545464","#8a8980","#4d699b","#766b90","#e7dca9","#d7d194","#c84053","#8a6f3f","#6f894e",
        "#766b90","#6f894e","#8a8980","#4d699b","#b35b79","#8a6f3f","#597b75","#545464"],
  },
];

// --- CSS generation ---

const varNames = [
  "--t-bg", "--t-fg", "--t-muted", "--t-accent", "--t-accent2",
  "--t-surface", "--t-border", "--t-red", "--t-yellow", "--t-green",
  "--t-syntax-keyword", "--t-syntax-string", "--t-syntax-comment",
  "--t-syntax-function", "--t-syntax-number", "--t-syntax-operator",
  "--t-syntax-type", "--t-syntax-punctuation",
];

function generateCSS(theme) {
  const lines = [
    `/* ${theme.label} theme for term.css */`,
    "",
    ":root {",
    "  color-scheme: light dark;",
    "",
  ];

  for (let i = 0; i < varNames.length; i++) {
    const lightVal = oklch(theme.l[i]);
    const darkVal = oklch(theme.d[i]);
    lines.push(`  ${varNames[i]}: light-dark(${lightVal}, ${darkVal});`);
    // Add blank line after --t-green (separating core from syntax)
    if (i === 9) lines.push("");
  }

  lines.push("}");
  lines.push("");
  lines.push(':root[data-theme="light"] {');
  lines.push("  color-scheme: light;");
  lines.push("}");
  lines.push("");
  lines.push(':root[data-theme="dark"] {');
  lines.push("  color-scheme: dark;");
  lines.push("}");
  lines.push("");

  return lines.join("\n");
}

// --- Write files ---

const outDir = path.join(__dirname, "../src/themes");

for (const theme of themes) {
  const css = generateCSS(theme);
  const filePath = path.join(outDir, `${theme.name}.css`);
  fs.writeFileSync(filePath, css);
  console.log(`✓ ${theme.name}.css`);
}

console.log(`\nGenerated ${themes.length} theme files in src/themes/`);
