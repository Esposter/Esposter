# Rust TypeScript toolchain

## Why

Every package's `typecheck` runs the classic `tsc` API, and the `typescript` package is an override onto `typescript-native-bridge`, which runs the Go compiler behind that API. That keeps the classic-API readers and the editor compiler on one implementation. The Rust port of the TypeScript 7 checker, `tsrs`, is a standalone CLI with no classic API, so it can replace the plain `tsc` runs without touching the Vue checks. Swapping those first is the cheapest step, and it shows whether `tsrs` is fast and faithful enough to carry the rest.

## What changes

The migration runs in phases. Each phase ends at a gate that decides whether the next one starts.

1. **Plain `tsc` typecheck to `tsrs --fast`.** Every package whose `typecheck` is plain `tsc` runs `tsrs --fast` instead, and the `noEmit` setting comes from the shared `tsconfig`. Its gate is a green workspace typecheck through the package scripts. Every package runs `tsrs --fast` today; `packages/db` spells two return types for it, and the comment on `upsertThreadFollow` says why.
2. **Carry the Vue checks through `vize`.** `tsrs` runs the `vize` content mapper for every Vue type check and every `.vue` declaration, and no package depends on `vue-tsc`. The gate was a result that matches `vue-tsc` on each package.
3. **Retire the `typescript-native-bridge` override only if nothing reads the classic API through it.** `typescript-eslint`, `attw` and `rolldown-plugin-dts` read the classic API from it, so the override stays until they stop.
4. **Drop the `typescript` package only if nothing in-process needs it.** `scripts/` reads source through `oxc-parser` rather than `typescript`, and the build and lint tooling reach the package through peers. The gate is either a replacement for each in-process use or a decision to keep the package.

## Out of scope

- Replacing `oxlint-tsgolint` or the type-aware lint pass. That is the `lint-toolchain` spec's, and it already runs the Go type checker natively.
- The `apps/web` Vue typecheck, which the [Vue typecheck change](../archive/2026-11-05-architecture-vize-vue-typecheck/proposal.md) moved from `nuxt typecheck` onto `tsrs` with the vize mapper.
- The one-interface-per-file sweep of the zod model files. That is the `schemas` ledger's, and it does not depend on this change.

## Open questions

- Does `tsrs` need a Vue-aware checker beyond the content mapper CLI, or is `vize` the one path? The language server does not run content mappers, so editor support for `.vue` files is the open part.
