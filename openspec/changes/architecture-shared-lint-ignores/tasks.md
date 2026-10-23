# Tasks

- [x] Decide where the tileset ignore glob is defined, and record the decision in the lint toolchain design (decided in the proposal and the lint toolchain design's notes: `oxlint.config.ts` exports it)
- [ ] Export the glob as a named constant from `oxlint.config.ts`, spread it into `ignorePatterns`, and import it in `packages/configuration/eslint/ignores.js`; confirm with a planted tileset violation run through `oxlint -c`
