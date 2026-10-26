# Vue type checks through vize's content mapper

## Why

Four packages check `.vue` files with `vue-tsc`, and `apps/web` checks them with `nuxt typecheck`, which runs `vue-tsc` underneath. `vue-tsc` reads the classic TypeScript API, so it is the last reason the `typescript-native-bridge` override exists. [The Rust toolchain change](../architecture-rust-typescript-toolchain/proposal.md) moved every plain `tsc` check to `tsrs`, and the Vue checks are the part it left behind. `vize` checks `.vue` files through a content mapper that TypeScript runs as a separate process, and `tsrs` implements that mapper protocol in its CLI. If the pair works, the Vue checks use the same compiler as everything else.

## What the spike showed

A scratch project with `vize@0.587.0`, the TypeScript 7.1 beta and `tsrs@0.20.0-ts7.1.0-beta` checked one `.vue` file with a deliberate type error, using the `contentMappers` entry from the vize README:

- `tsc --runExternalCode` reports the error at its original location in the `.vue` file, `Hello.vue(5,7)`.
- `tsrs --runExternalCode` fails before any type checking: `TS18069`, "The content mapper 'vize' failed to transform this file. The content mapper process failed while handling the project request." Adding the mapper's declared compiler options (`rootDir`, `checkJs`, `noUnusedLocals`) does not change the result.
- `tsrs` without `--runExternalCode` refuses the config with `TS18068`, which is the expected guard.

So the content-mapper path works through the TypeScript 7.1 beta compiler and does not yet work through `tsrs`. The `tsrs` side of the failure is the one to report upstream. Its mapper-host notes describe the protocol it implements, and the failure is inside that host.

## What changes

The migration is gated, and nothing is removed until its gate passes.

1. **Hold the `tsrs` gap open and recorded.** The Vue packages keep `vue-tsc` until `tsrs` runs the vize mapper. The gap is written upstream by the owner, with the spike's project as the reproduction.
2. **Decide the compiler the Vue checks run on.** The mapper path the spike proved needs the TypeScript 7.1 beta, so either `typescript` moves to that release for the Vue packages, or the Vue packages get their own `typescript` alias. The choice is taken in the design, against the other in-process uses of the `typescript` package.
3. **Pilot one small Vue package.** Run `vize` through the chosen compiler on one package, and compare its diagnostics with `vue-tsc` on the same program. The gate is a match on every diagnostic the package produces.
4. **Extend the pilot to the four `vue-tsc` packages and `apps/web`.** `apps/web`'s `nuxt typecheck` is the hard one, because Nuxt generates the types it checks against. That gate is a separate decision in the design.
5. **Retire `vue-tsc` and the override only after every Vue package passes.** The `typescript-native-bridge` override is removed in the same change, since nothing else reads it.

## Out of scope

- The `tsrs` declaration-portability gap (`TS2883`) on `packages/db`, which is tracked by the Rust toolchain change.
- Replacing `oxlint-tsgolint`, which runs its own native binaries and does not load the `typescript` package.
- Editor diagnostics for `.vue` files. `tsrs`'s language server does not run content mappers, so the editor keeps its current path until that changes upstream.

## Open questions

- Does the 7.1 beta compiler still need the `typescript-native-bridge` fork for the Vue packages' speed, and what is the speed difference on a real package? The spike did not measure it.
- vize's own conformance runs against one pinned TypeScript commit and its parity check against `vue-tsc` is report-only. Which of those is the bar for "matches" is the owner's call.
