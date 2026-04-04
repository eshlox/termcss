import { defineEcConfig } from "astro-expressive-code";

export default defineEcConfig({
  themes: ["light-plus", "dark-plus"],
  themeCssSelector: (theme) =>
    theme.type === "light"
      ? ':root:not([data-theme="dark"])'
      : '[data-theme="dark"]',
  frames: false,
  styleOverrides: {
    borderRadius: "0",
    borderColor: "var(--t-border)",
    codeBackground: "light-dark(var(--t-bg), var(--t-surface))",
    codeFontFamily:
      '"JetBrains Mono", ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, "DejaVu Sans Mono", monospace',
    codeFontSize: "inherit",
    codeLineHeight: "inherit",
    codePaddingBlock: "0.25em",
    codePaddingInline: "0.5em",
    uiFontFamily: "inherit",
    uiFontSize: "inherit",
  },
});
