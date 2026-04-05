# term.css

A minimal, classless CSS framework with terminal aesthetics.

Write semantic HTML. Get a styled page. No classes required.

## Quick Start

```bash
npm install @eshlox/termcss
```

Import in your CSS or bundler:

```css
@import "@eshlox/termcss";
```

Or link directly in HTML:

```html
<link rel="stylesheet" href="node_modules/@eshlox/termcss/dist/term.min.css">
```

## Features

- **Classless** - styles every HTML element out of the box
- **Terminal aesthetic** - monospace, dark-first design
- **Themeable** - 10 CSS variables control the entire look
- **13 themes** - default plus 12 popular schemes
- **Theme generator** - `npx @eshlox/termcss --hue 200 --name ocean`
- **Accessible** - WCAG 2.1 AA contrast ratios, focus rings, reduced motion
- **Dark & Light** - auto-detects system preference, or set with `data-theme`
- **Tiny** - single CSS file, no JavaScript

## Themes

Add a theme after the base stylesheet:

```css
@import "@eshlox/termcss";
@import "@eshlox/termcss/themes/dracula.min.css";
```

Available: `dracula`, `nord`, `solarized`, `one-dark`, `monokai`, `tokyo-night`, `catppuccin`, `rose-pine`, `gruvbox`, `everforest`, `github`, `kanagawa`.

## Documentation

Full docs, interactive playground, and examples at the [project repository](https://github.com/eshlox/termcss).

## License

[MIT](https://github.com/eshlox/termcss/blob/main/LICENSE)
