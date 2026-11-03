# tsrslint type-aware lint

`@maschwenk/tsrslint` is a Rust port of tsgolint on tsrs that oxlint reaches through `OXLINT_TSGOLINT_PATH`, which `vp lint` honors. It runs the same 61 type-aware rules with the same findings as `oxlint-tsgolint`.

## Why not

**It is faster and lighter on Linux only.** It lints the packages tree about three times faster in about half the memory. It ships no Windows binary, so Windows would keep tsgolint and the pass would run on two backends.

**It cannot read a content mapper.** It cannot read a tsconfig carrying a content mapper: tsrs refuses a mapper unless `--runExternalCode` is passed, and tsrslint's headless mode takes no such flag. `packages/vue-phaserjs`, `packages/genshin-world` and `packages/genshin-interface` carry the `vize` mapper in `tsconfig.vue.json`, so each reports `tsconfig-error` and the lint exits 1.

## Revisit when

tsrslint accepts the flag that lets tsrs read a content mapper, **or** oxlint ships tsrs as a backend of its own ([oxc-project/tsrs 378](https://github.com/oxc-project/tsrs/issues/378)). Either one removes the tsconfig error; the Windows gap remains until a binary ships there.

## Key files

| File                                                   | Role                                                                |
| :----------------------------------------------------- | :------------------------------------------------------------------ |
| `oxlint.config.ts`                                     | sets `typeAware: true`, the setting the type-aware backend serves   |
| `package.json`                                         | the two root oxlint lint scripts, each run with `--debug=timings`   |
| `packages/configuration/tsconfig.vue.json`             | declares the `vize` content mapper that tsrslint cannot read        |
| `openspec/specs/architecture/lint-toolchain/design.md` | the spec that states the decision and points here for the rationale |
