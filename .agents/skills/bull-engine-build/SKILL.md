---
name: bull-engine-build
description: Build and validate projects using @nmhillusion/n2ngin-bull-engine
---

# BullEngine Build & Validate Skill

This skill defines how to build and validate projects that use `@nmhillusion/n2ngin-bull-engine` for compiling Pug, SCSS, and TypeScript.

## Build

Run the build command. This will clean the `dist/` folder, copy public assets, and compile all source files:

```bash
npm run build
```

The build script (`build.mts`) handles:

- Cleaning the `dist/` directory
- Copying `public/` folder contents to `dist/`
- Compiling `.pug` → `.html`
- Compiling `.scss` → `.css`
- Compiling `.ts` → `.js`
- Rewriting JavaScript imports

## Validate

After building, validate that the output is correct:

1. **Check dist structure** — ensure all expected files exist:

```bash
ls -la dist/ && ls -la dist/popup/
```

2. **Verify manifest.json** — ensure it's valid JSON:

```bash
node -e "JSON.parse(require('fs').readFileSync('dist/manifest.json','utf8')); console.log('manifest.json is valid')"
```

3. **Expected output structure**:

```
dist/
├── background.js
├── content.js
├── icons/
├── manifest.json
└── popup/
    ├── popup.css
    ├── popup.html
    └── popup.js
```

## Watch Mode

For development with auto-rebuild on file changes:

```bash
npm run dev
```

## Troubleshooting

- If TypeScript compilation fails, check that `@types/chrome` and `@types/node` are installed.
- The build script uses `node --experimental-strip-types` with `.mts` extension for native TypeScript support in Node.js v22+.
- The `.mts` extension forces ESM mode, so `import` statements work even in CommonJS projects.
