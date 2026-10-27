# Tasks

## 1. Hold the mapper gap open

- [ ] 1.1 The owner files the upstream `tsrs` report with the spike project as the reproduction: `TS18069` from `tsrs --runExternalCode` against `vize@0.587.0`, with the `tsc --runExternalCode` run beside it as the passing reference. Verified by an upstream issue link recorded in `design.md` under "Decisions".
- [ ] 1.2 Re-run the spike when `tsrs` publishes a release past `0.20.0-ts7.1.0-beta`. Verified by the spike's `tsrs` run passing with one error reported at `Hello.vue(5,7)`, or the upstream issue's recorded reason it cannot.

## 2. Decide the compiler the Vue checks run on

- [ ] 2.1 Choose between moving `typescript` to the 7.1 beta and aliasing a second copy for the Vue packages, against the `scripts/` in-process uses. Verified by a recorded choice in `design.md`, replacing "The compiler for the proven path".
- [x] 2.2 Choose the pilot: one small package whose `typecheck` runs `vue-tsc` today and that has real `.vue` files, in place of `packages/vue-canvas-frame-headless`, which runs `tsrs` and has none. Verified by a recorded choice in `design.md`'s pilot paragraph: `packages/vue-phaserjs`.

## 3. Pilot one small Vue package

- [x] 3.1 Run `vize` through the chosen compiler on the pilot chosen in 2.2, and compare its diagnostics with `vue-tsc` on the same program. Verified by a diff of the two diagnostic lists recorded in `design.md`, empty on both the error set and the locations.
- [ ] 3.2 Record any mismatch in `design.md` before the next package starts, and report upstream any mismatch that is a `vize` or `tsrs` defect. Verified by each mismatch appearing in `design.md` with its outcome.

## 4. Extend to the remaining Vue packages

- [ ] 4.1 Run the same comparison on `packages/genshin-interface`, `packages/genshin-world` and `packages/vue-phaserjs`, each as its own commit. Verified by each package's diagnostic diff recorded in `design.md`.

## 5. The `apps/web` Nuxt typecheck

- [ ] 5.1 Decide whether `vize` replaces `nuxt typecheck` or runs beside it, in `design.md`, after reading how Nuxt generates its check inputs. Verified by a recorded decision with the spike's `apps/web` diagnostic diff.

## 6. Retire `vue-tsc` and the override

- [ ] 6.1 Remove `vue-tsc` from every Vue package once each one's comparison has passed, and remove the `typescript-native-bridge` override in the same change. Verified by the workspace typecheck passing through the package scripts, and `pnpm ai:dependencies:score` showing no `vue-tsc` dependent.
- [ ] 6.2 Rewrite `openspec/specs/architecture/monorepo-tooling/design.md`'s "TypeScript compiler" section as built, and archive this change. Verified by `pnpm exec openspec validate architecture-vize-vue-typecheck --strict --no-interactive`.
