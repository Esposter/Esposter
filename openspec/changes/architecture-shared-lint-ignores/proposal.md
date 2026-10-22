# Shared tileset ignore glob

## Why

The Tiled tileset glob `**/assets/dungeons/tilesets/**/*.tsx` is written twice: in `oxlint.config.ts` under `ignorePatterns`, and in `packages/configuration/eslint/ignores.js`, whose comment says the two entry configs must never ignore different trees. A move of the tileset folder has to edit both files, and nothing fails when only one of them is edited. The [lint toolchain](../../specs/architecture/lint-toolchain/design.md) owns both configs.

Sharing the glob is a design call, not a mechanical edit. oxlint reads a TypeScript config and ESLint reads a JavaScript one from the same workspace package, so the shared value has to cross a config format boundary, and the choice of where it lives decides who can import it.

## What Changes

Decide where the tileset glob is defined, once, and have both entry configs read it from there. Options:

- Export the glob from `packages/configuration/eslint/ignores.js` and import it in `oxlint.config.ts`, which already imports the workspace configuration package.
- Move the glob into a plain data module that both configs import, so neither config owns it.

Until the decision is made, nothing changes.

## Capabilities

- **architecture/lint-toolchain** (modified, once decided)

## Impact

- `oxlint.config.ts` `ignorePatterns`.
- `packages/configuration/eslint/ignores.js` and its comment.
