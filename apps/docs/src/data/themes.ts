export const themes = [
  { name: "default", label: "Default" },
  { name: "dracula", label: "Dracula" },
  { name: "nord", label: "Nord" },
  { name: "solarized", label: "Solarized" },
  { name: "one-dark", label: "One Dark" },
  { name: "monokai", label: "Monokai" },
  { name: "tokyo-night", label: "Tokyo Night" },
  { name: "catppuccin", label: "Catppuccin" },
  { name: "rose-pine", label: "Rosé Pine" },
  { name: "gruvbox", label: "Gruvbox" },
  { name: "everforest", label: "Everforest" },
  { name: "github", label: "GitHub" },
  { name: "kanagawa", label: "Kanagawa" },
] as const;

export const themeCount = themes.length;
export const nonDefaultThemes = themes.filter((t) => t.name !== "default");
