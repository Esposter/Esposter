# Vue type checks through vize's content mapper

## Why

`.vue` files were checked by `vue-tsc` in three packages and by `nuxt typecheck` in `apps/web`, which runs `vue-tsc` underneath. `vue-tsc` reads the classic TypeScript API, which `tsrs` ships none of, so it kept running on the `typescript-native-bridge` override that other tools read too (`design.md`, "What reads the classic `typescript` API"). [The Rust toolchain change](../architecture-rust-typescript-toolchain/proposal.md) moved every plain `tsc` check to `tsrs`, and the Vue checks were the part it left behind. `vize` checks `.vue` files through a content mapper that TypeScript runs as a separate process, and `tsrs` implements that mapper protocol in its CLI. With the pair working, the Vue checks use the same compiler as everything else.

## Where it stands

Every Vue check now runs on `tsrs` with the mapper: the three Vue packages and `apps/web`, whose `typecheck` no longer runs `nuxt typecheck`. On `vize` 0.661.0 the mapper reports no diagnostic that `vue-tsc` does not, and is 3.6 to 4.9 times faster on a quarter to under half of the memory (`design.md`, "Timings, cold and warm"). What is left is the declaration emit for `.vue` files, which still goes through `vue-tsc`, and the removal that follows it.

## What changes

The migration was gated, and nothing is removed until its gate passes.

1. **Hold the `tsrs` gap open and recorded.** Done. The Vue packages kept `vue-tsc` until `tsrs` ran the vize mapper, which 0.20.1 does.
2. **Decide the compiler the Vue checks run on.** Not needed. `tsrs` runs the mapper on its own compiler, so neither moving `typescript` to the 7.1 beta nor aliasing a second copy was taken.
3. **Compare on one small Vue package.** Done on `vue-phaserjs`, then `genshin-interface` and `genshin-world`. The gate was a match on every diagnostic the package produces.
4. **Extend the comparison to the three `vue-tsc` packages and `apps/web`.** Done. `apps/web` runs the mapper over the app project Nuxt generates and `tsrs` over its other four generated projects, in place of `nuxt typecheck`.
5. **Retire `vue-tsc` only after every Vue package passes.** Waiting on the declaration emit (`tasks.md`, 6.1). The `typescript-native-bridge` override stays, since `typescript-eslint`, the `attw` gate and the root `tsc` read the classic API through it.

## Out of scope

- The `tsrs` declaration-portability gap (`TS2883`) on `packages/db`, which is tracked by the Rust toolchain change.
- Dropping the `typescript-native-bridge` override. It is a speed choice across every classic-API reader and not only `vue-tsc`'s need, and moving it moves all of them at once (`design.md`, "What reads the classic `typescript` API").
- Replacing `oxlint-tsgolint`, which runs its own native binaries and does not load the `typescript` package.
- Editor diagnostics for `.vue` files. `tsrs`'s language server does not run content mappers, so the editor keeps its current path until that changes upstream.

## Settled questions

- Does the mapper need the `typescript-native-bridge` fork for speed? No. It runs on `tsrs` and is 3.6 to 4.9 times faster than `vue-tsc` on the bridge, on every target (`design.md`, "Timings, cold and warm").
- What is the bar for "matches"? The mapper and `vue-tsc` report the same diagnostics on the same program, and each catches a deliberate error written into a `.vue` file. Both report none on all four targets. vize's own conformance runs against one pinned TypeScript commit and its parity check against `vue-tsc` is report-only, so neither is the bar.
