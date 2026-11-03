# Rust TypeScript toolchain

## Why

Every package's `typecheck` runs the classic `tsc` API, and the `typescript` package is an override onto `typescript-native-bridge`, which runs the Go compiler behind that API. That keeps the Vue checks (`vue-tsc`, which reads the classic API) and the editor compiler on one implementation. The Rust port of the TypeScript 7 checker, `tsrs`, is a standalone CLI with no classic API, so it can replace the plain `tsc` runs without touching the Vue checks. Swapping those first is the cheapest step, and it shows whether `tsrs` is fast and faithful enough to carry the rest.

## What changes

The migration runs in phases. Each phase ends at a gate that decides whether the next one starts.

1. **Plain `tsc` typecheck to `tsrs --fast`.** Every package whose `typecheck` is plain `tsc` runs `tsrs --fast` instead, and the `noEmit` setting comes from the shared `tsconfig`. Its gate is a green workspace typecheck through the package scripts. Every package runs `tsrs --fast` today; `packages/db` spells two return types for it, and the comment on `upsertThreadFollow` says why.
2. **Spike the Vue checks.** Run `vize` content mappers through `tsrs` on one small Vue package and compare its diagnostics with `vue-tsc`. The gate is a result that matches on that package. Nothing is removed in this phase.
3. **Retire `vue-tsc` only if phase 2 passes everywhere.** Until then the `typescript-native-bridge` override stays, because `vue-tsc` and `@volar/typescript` read the classic API from it.
4. **Drop the `typescript` package only if nothing in-process needs it.** Today `scripts/` imports `typescript` in-process in seventeen files, and the build and lint tooling reach it through peers. The gate is either a replacement for each in-process use or a decision to keep the package.

## Out of scope

- Replacing `oxlint-tsgolint` or the type-aware lint pass. That is the `lint-toolchain` spec's, and it already runs the Go type checker natively.
- The `apps/web` Vue typecheck, which the [Vue typecheck change](../architecture-vize-vue-typecheck/proposal.md) moved from `nuxt typecheck` onto `tsrs` with the vize mapper.
- The one-interface-per-file sweep of the zod model files. That is the `schemas` ledger's, and it does not depend on this change.

## Open questions

- Does `tsrs` need a Vue-aware checker beyond the content mapper CLI, or is `vize` the one path? The language server does not run content mappers, so editor support for `.vue` files is the open part.
- Which of the `scripts/` uses of the TypeScript API has a `tsrs` equivalent (its `ast` subpath, or a parser change), and which needs the package kept?
