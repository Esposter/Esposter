# Vue type checks through vize's content mapper

## Why

Every plain TypeScript check runs on `tsrs`, the Rust port of the TypeScript 7 checker, which ships no classic TypeScript API. The `.vue` files need the same compiler. `vize` checks `.vue` files through a content mapper that TypeScript runs as a separate process, and `tsrs` implements that mapper protocol in its CLI. [The Rust toolchain change](../architecture-rust-typescript-toolchain/proposal.md) runs the plain checks on `tsrs`, and this change runs the Vue checks there too, so the classic API is read only by the tools that need it (`design.md`, "What reads the classic `typescript` API").

## Where it stands

Every Vue check runs on `tsrs` with the mapper: the three Vue packages and `apps/web`, whose `typecheck` is `nuxt prepare` followed by one `tsrs -b` over the projects Nuxt generates. The `.vue` declarations come from the same mapper through `tsrs`'s declaration generator, so no package runs `vue-tsc`. The Vue packages' builds compile through `@vizejs/unplugin` and their Vitest runs through `@vizejs/vite-plugin` ([build pipeline](../../specs/architecture/build-pipeline/design.md)). `vize` is held at `~0.684.0` by a Renovate rule, for the reason in `design.md`, "Constraints that remain".

## What changes

The migration was gated, and each gate passed before the next step started.

1. **Hold the `tsrs` gap open and recorded.** Done. `tsrs` runs the vize mapper from 0.20.1 (`tasks.md`, 1.2).
2. **Decide the compiler the Vue checks run on.** Not needed; the decision is recorded in `design.md`, "The Vue checks run on `tsrs`, not on a second compiler".
3. **Compare on one small Vue package.** Done on `vue-phaserjs`, then `genshin-interface` and `genshin-world`. The gate is a match on every diagnostic the package produces.
4. **Extend the comparison to the other Vue packages and `apps/web`.** Done. `apps/web`'s `typecheck` is `nuxt prepare` followed by one `tsrs -b` over the projects Nuxt generates, the app's through the mapper.
5. **Retire `vue-tsc` only after every Vue package passes.** Done once the declarations moved to the mapper (`tasks.md`, 6.1). The `typescript-native-bridge` override stays, since `typescript-eslint`, the `attw` gate and `rolldown-plugin-dts` read the classic API through it. The root typecheck runs `tsrs --fast` and loads none.

## Out of scope

- Dropping the `typescript-native-bridge` override. It is a speed choice across every classic-API reader, and moving it moves all of them at once (`design.md`, "What reads the classic `typescript` API").
- Replacing `oxlint-tsgolint`, which runs its own native binaries and does not load the `typescript` package.
- Editor diagnostics for `.vue` files. They come from the vize extension (`ubugeeei.vize`), which runs its own TypeScript 7 session, because `tsrs`'s language server does not run content mappers. Its README calls it experimental.

## Settled questions

- Does the mapper need the `typescript-native-bridge` fork for speed? No. It runs on `tsrs`, which ships no classic API (`design.md`, "Timings, cold and warm").
- What is the bar for "matches"? The mapper reports the same diagnostics as `vue-tsc` on the same program, and each catches a deliberate error written into a `.vue` file. vize's own conformance runs against one pinned TypeScript commit and its parity check against `vue-tsc` is report-only, so neither is the bar.
