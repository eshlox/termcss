# term.css

A minimal, classless CSS framework with terminal aesthetics.

Write semantic HTML. Get a styled page. No classes required.

Designed for blogs, docs, personal sites, and technical writing. Not a component framework or browser TUI kit.

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
- **13 themes** - a default plus 12 popular schemes: dracula, nord, solarized, one-dark, monokai, tokyo-night, catppuccin, rosé pine, gruvbox, everforest, github, kanagawa
- **Theme generator** - create themes from a single hue value with WCAG validation
- **Accessible** - WCAG 2.1 AA contrast ratios, focus rings, reduced motion support
- **Dark & Light** - auto-detects system preference, or set manually with `data-theme`
- **Tiny** - single CSS file, no JavaScript
- **Responsive** - works on all screen sizes
- **Components** - optional `t-` prefixed classes for cards, badges, callouts, and more

## Themes

Add a theme after the base stylesheet:

```css
@import "@eshlox/termcss";
@import "@eshlox/termcss/themes/dracula.min.css";
```

Available: `dracula`, `nord`, `solarized`, `one-dark`, `monokai`, `tokyo-night`, `catppuccin`, `rose-pine`, `gruvbox`, `everforest`, `github`, `kanagawa`.

### Generate a custom theme

```bash
npx @eshlox/termcss --hue 200 --name ocean
```

The generator validates WCAG AA contrast ratios and fails if any pair doesn't meet the threshold.

## Dark / Light Mode

term.css auto-detects via `prefers-color-scheme`. To override:

```html
<html data-theme="dark">  <!-- force dark -->
<html data-theme="light"> <!-- force light -->
```

## CSS Variables

| Variable | Purpose |
|----------|---------|
| `--t-bg` | Page background |
| `--t-fg` | Body text |
| `--t-muted` | Secondary text |
| `--t-accent` | Links, headings, primary accent |
| `--t-accent2` | Badges, marks, secondary accent |
| `--t-surface` | Code blocks, cards, inputs |
| `--t-border` | Borders, dividers |
| `--t-red` | Error, danger states |
| `--t-yellow` | Warning, caution states |
| `--t-green` | Success, confirmed states |

## Components

Optional class-based UI patterns (all prefixed `t-`):

`.t-card` `.t-grid` `.t-badge` `.t-callout` `.t-table-bordered` `.t-error` `.t-warn` `.t-success` `.t-info`

## Browser Support

Chrome 123+, Firefox 121+, Safari 18+.

## License

[MIT](LICENSE)
