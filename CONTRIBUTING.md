# Contributing to term.css

## Development Setup

```bash
git clone https://github.com/eshlox/term.css.git
cd term.css
pnpm install
pnpm build
```

Open `packages/term.css/test/index.html` in a browser to see the visual test page.

## Project Structure

```
packages/term.css/        # CSS library (published to npm)
  src/
    term.css              # Entry point (imports all modules)
    font.css              # JetBrains Mono web font declarations
    reset.css             # Targeted CSS reset
    base.css              # Classless element styles
    components.css        # Optional .t- prefixed components
    syntax.css            # Syntax highlighting token mapping
    accessibility.css     # Focus rings, skip link, reduced motion
    scrollbar.css         # Custom scrollbar styles
    print.css             # Print stylesheet
    themes/               # Theme files (variable overrides)
  scripts/
    build-css.js          # Bundles src → dist via Lightning CSS
    build-themes.js       # Builds all theme files
    generate-theme.js     # CLI theme generator
    generate-popular-themes.js  # Regenerates all bundled themes
  test/                   # Visual test page
apps/docs/                # Astro documentation site
scripts/                  # Root-level monorepo scripts
  check-consistency.mjs   # Validates themes, classes, README sync
```

## Build Commands

| Command | Description |
|---------|-------------|
| `pnpm build` | Build CSS + themes + docs |
| `pnpm build:css` | Build only main CSS |
| `pnpm build:themes` | Build only theme files |
| `pnpm dev` | Start Astro docs dev server |
| `pnpm check` | Run consistency checks (themes, classes, README) |

## Creating a Theme

1. Generate a starting point:

```bash
node packages/term.css/scripts/generate-theme.js --hue <0-360> --name <name>
```

2. The generator creates `./<name>.css` in the current directory (use `--out` for a custom path) with `light-dark()` values for both modes.

3. The generator validates WCAG AA contrast ratios. If any fail, it exits with an error - fix the lightness values until all pass.

4. Test your theme by opening `packages/term.css/test/index.html` and adding a `<link>` to your theme file.

## Code Style

- **Colors**: Always use OKLCH (`oklch(L C H)`)
- **Variables**: Use `--t-` prefix for theme variables
- **Classes**: Use `t-` prefix for component classes
- **No JavaScript**: The CSS framework itself must be JS-free
- **Classless first**: New elements should work without classes
- **Selectors**: Prefer element selectors over classes when possible

## Submitting a PR

1. Fork the repo and create a branch
2. Make your changes
3. Run `pnpm build` to verify the build succeeds
4. Open `packages/term.css/test/index.html` and verify visually
5. For themes: ensure all contrast ratios pass
6. Submit a PR with a clear description of what changed

## Contrast Requirements

All text must meet WCAG 2.1 AA:

| Pair | Minimum |
|------|---------|
| fg / bg | 4.5:1 |
| muted / bg | 4.5:1 |
| accent / bg | 4.5:1 |
| red / bg | 4.5:1 |
| yellow / bg | 4.5:1 |
| green / bg | 4.5:1 |
