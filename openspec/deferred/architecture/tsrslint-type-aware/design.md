# tsrslint type-aware lint

tsrs's own type-aware linter, `tsrs --lint` launched as `tsrs-lint` (first the third-party `@maschwenk/tsrslint`), is a Rust port of tsgolint that oxlint reaches through `OXLINT_TSGOLINT_PATH`, which `vp lint` honors. It runs the same 61 type-aware rules with the same findings as `oxlint-tsgolint`, and tsrs 0.21.0 ships it.

## Why not

**The speed is real and the platform gap is closed.** It lints a sample of the packages tree about twice as fast, and the launcher runs on Windows through its `.cmd` shim. The path is a setting either way: oxlint finds its backend only as the `oxlint-tsgolint` package or through the variable, so the value is the `.cmd` launcher on Windows and the extensionless one elsewhere.

**A content mapper needs a switch oxlint cannot pass.** `tsrs --lint` reads a tsconfig carrying a content mapper only with `--runExternalCode` or `TSRS_LINT_RUN_EXTERNAL_CODE=1`, and oxlint runs `<path> headless` with no extra flags, so the switch is the environment variable, set for the lint scripts and for CI. `packages/vue-phaserjs`, `packages/genshin-world` and `packages/genshin-interface` carry the `vize` mapper in `tsconfig.vue.json`, so without the variable each reports `tsconfig-error` and the lint exits 1 ([oxc-project/tsrs 876](https://github.com/oxc-project/tsrs/issues/876), fixed by [oxc-project/tsrs 883](https://github.com/oxc-project/tsrs/pull/883)).

**The package cannot leave yet.** `vite-plus` depends on `oxlint-tsgolint`, and `vp lint` resolves it on every run, type-aware or not, so removing the package throws even with the `vite-plus>oxlint-tsgolint` override in place ([voidzero-dev/vite-plus 3339](https://github.com/voidzero-dev/vite-plus/issues/3339)). Taking the faster backend while keeping the package installed would leave two type-aware backends and a dependency nothing runs, so the swap is one change made once the package can go.

## Revisit when

`vp lint` stops resolving `oxlint-tsgolint` unconditionally ([voidzero-dev/vite-plus 3339](https://github.com/voidzero-dev/vite-plus/issues/3339)). Oxlint shipping tsrs as a backend of its own ([oxc-project/tsrs 378](https://github.com/oxc-project/tsrs/issues/378)) retires the path and the variable below, and until then they are marked with a `@TODO` to drop once oxlint finds the backend itself.

## What the swap changes

- **The package goes.** `oxlint-tsgolint` leaves the root `package.json`, the catalog and the `vite-plus>oxlint-tsgolint` override in `pnpm-workspace.yaml`.
- **The backend is a setting.** The two root oxlint scripts and CI set `OXLINT_TSGOLINT_PATH` to the `tsrs-lint` launcher (its `.cmd` shim on Windows) and `TSRS_LINT_RUN_EXTERNAL_CODE=1`.
- **The pages that name the package are rewritten for the new backend.** The ledger row for `oxlint-tsgolint` in `.agents/ledgers/dependencies.md`, its entry in the `dependency-updates` skill's `references/tracked-issues.md` and the lines that point at it in that skill's `SKILL.md`, the `oxlint` skill's `references/ignore-patterns.md` and `references/type-aware-cost.md`, and the [lint-toolchain](../../../specs/architecture/lint-toolchain/design.md), [vite-plus](../../../specs/architecture/vite-plus/design.md) and [monorepo-tooling](../../../specs/architecture/monorepo-tooling/design.md) designs.
- **What exists for the old checker is measured again.** The `ignorePatterns` entry for tsgo's infinite loop and the `overrides` that switch rules off for the mod trees were written against tsgolint's checker and cost, so each is rechecked on the new backend before it stays.

## Key files

| File                                                   | Role                                                                |
| :----------------------------------------------------- | :------------------------------------------------------------------ |
| `oxlint.config.ts`                                     | sets `typeAware: true`, the setting the type-aware backend serves   |
| `package.json`                                         | the two root oxlint lint scripts, each run with `--debug=timings`   |
| `packages/configuration/tsconfig.vue.json`             | declares the `vize` content mapper that tsrslint cannot read        |
| `openspec/specs/architecture/lint-toolchain/design.md` | the spec that states the decision and points here for the rationale |
