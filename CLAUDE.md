# term.css

Minimal, classless CSS framework with terminal aesthetics. pnpm monorepo.

## Project Structure
- `packages/term.css/` - The CSS library (published to npm)
  - `src/` - Source CSS files (modular, imported by `src/term.css`)
    - `font.css` - JetBrains Mono web font declarations
    - `reset.css`, `base.css`, `components.css`, `accessibility.css`
    - `scrollbar.css`, `print.css`, `syntax.css`
  - `src/themes/` - Theme files (CSS variable overrides only)
  - `scripts/` - Build and theme generation scripts
  - `dist/` - Built output (git-ignored)
  - `test/` - Visual test page
- `apps/docs/` - Astro documentation site
  - `plans/` - Design and implementation docs
- `docs/plans/` - Additional design and implementation docs
- `scripts/` - Root-level scripts (consistency checker)

## Build
- `pnpm install` - Install all workspace dependencies
- `pnpm build` - Build CSS library + docs
- `pnpm build:css` - Build only main CSS
- `pnpm build:themes` - Build only theme files
- `pnpm dev` - Start Astro docs dev server
- `pnpm check` - Run consistency checks (themes, classes, README)
- `pnpm changeset` - Create a changeset for versioning
- `pnpm release` - Build and publish to npm via changesets

## Key Conventions
- All CSS variables prefixed with `--t-`
- All colors in OKLCH format
- Classless base styles via element selectors + optional `t-` prefixed component classes
- Only non-component class: `.skip-link` (accessibility)
- Themes override variables only, never structural CSS
- Lightning CSS handles bundling, minification, autoprefixing, OKLCH fallbacks

## Testing
- Open `packages/term.css/test/index.html` in a browser to visually verify all elements
- Check contrast ratios when modifying color values (WCAG 2.1 AA: 4.5:1 normal, 3:1 large)
