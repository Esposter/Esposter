# Shared tileset ignore glob

## Why

The Tiled tileset glob `**/assets/dungeons/tilesets/**/*.tsx` is written twice: in `oxlint.config.ts` under `ignorePatterns`, and in `packages/configuration/eslint/ignores.js`, whose comment says the two entry configs must never ignore different trees. A move of the tileset folder has to edit both files, and nothing fails when only one of them is edited. The [lint toolchain](../../specs/architecture/lint-toolchain/design.md) owns both configs.

Sharing the glob is a design call, not a mechanical edit. oxlint reads a TypeScript config and ESLint reads a JavaScript one from the same workspace package, so the shared value has to cross a config format boundary, and the choice of where it lives decides who can import it.

## What Changes

Decided: `oxlint.config.ts` owns the glob. It exports the tileset glob as a named constant, its `ignorePatterns` spreads that constant, and `packages/configuration/eslint/ignores.js` imports it from there. The ESLint file takes the same `../../../oxlint.config.ts` import that `packages/configuration/eslint/oxlint.js` already makes, so no new file and no new dependency edge appear, and `oxlint.config.ts` gains no workspace import.

Rejected: a plain data module both configs import. It is one more file to edit when the tilesets move, and it holds nothing the root config does not already own. Also rejected, for now: deriving ESLint's ignores from all of oxlint's `ignorePatterns`. That widens what ESLint skips (`.claude`, `auto-imports.d.ts`, `useFluidSimulator.ts`) and needs its own review.

The implementation checks one thing before it lands: oxlint loads a config file with a named export beside its default, so a planted-violation run through `oxlint -c` on the tileset folder must still show the glob applied.

## Capabilities

- **architecture/lint-toolchain** (modified, once decided)

## Impact

- `oxlint.config.ts` `ignorePatterns`.
- `packages/configuration/eslint/ignores.js` and its comment.
