# tsrslint type-aware lint

tsrs's own type-aware linter, `tsrs --lint` launched as `tsrs-lint` (first the third-party `@maschwenk/tsrslint`), is a Rust port of tsgolint that oxlint reaches through `OXLINT_TSGOLINT_PATH`, which `vp lint` honors. It runs the same 61 type-aware rules with the same findings as `oxlint-tsgolint`, and tsrs 0.21.0 ships it.

## Why not

**The speed is real and the platform gap is closed.** It lints a sample of the packages tree about twice as fast, and the launcher runs on Windows through its `.cmd` shim. The path is a setting either way: oxlint finds its backend only as the `oxlint-tsgolint` package or through the variable, so the value is the `.cmd` launcher on Windows and the extensionless one elsewhere.

**It cannot read a content mapper.** It cannot read a tsconfig carrying a content mapper: tsrs refuses a mapper unless `--runExternalCode` is passed, and `tsrs --lint` rejects that flag as an unknown option and has no environment switch for it. `packages/vue-phaserjs`, `packages/genshin-world` and `packages/genshin-interface` carry the `vize` mapper in `tsconfig.vue.json`, so each reports `tsconfig-error` and the lint exits 1. Leaving the three out would drop their other oxlint rules too, since `ignorePatterns` is the only per-file lever.

## Revisit when

`tsrs --lint` accepts a way to run a content mapper, a flag or a variable ([oxc-project/tsrs 876](https://github.com/oxc-project/tsrs/issues/876)), **or** oxlint ships tsrs as a backend of its own ([oxc-project/tsrs 378](https://github.com/oxc-project/tsrs/issues/378)). Either one removes the tsconfig error, and then the swap is the path setting, marked with a `@TODO` to drop once oxlint finds the backend itself, plus removing `oxlint-tsgolint`. That removal needs the `vite-plus>oxlint-tsgolint` override, because vite-plus depends on it, and with the override `vp lint` throws on every run, type-aware or not, until it stops resolving the package unconditionally ([voidzero-dev/vite-plus 3339](https://github.com/voidzero-dev/vite-plus/issues/3339)).

## Key files

| File                                                   | Role                                                                |
| :----------------------------------------------------- | :------------------------------------------------------------------ |
| `oxlint.config.ts`                                     | sets `typeAware: true`, the setting the type-aware backend serves   |
| `package.json`                                         | the two root oxlint lint scripts, each run with `--debug=timings`   |
| `packages/configuration/tsconfig.vue.json`             | declares the `vize` content mapper that tsrslint cannot read        |
| `openspec/specs/architecture/lint-toolchain/design.md` | the spec that states the decision and points here for the rationale |
