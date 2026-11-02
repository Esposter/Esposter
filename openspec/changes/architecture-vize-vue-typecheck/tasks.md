# Tasks

## 1. Hold the mapper gap open

- [x] 1.1 The `TS18069` gap needs no report from this repo: it was `tsrs`'s Windows launch of the mapper's bare `node`, already reported as `tsrs` `#820` and fixed by `#822`. Recorded in `design.md`, "Notes" and "Landmines".
- [x] 1.2 Re-run the spike when `tsrs` publishes a release past `0.20.0-ts7.1.0-beta`. Verified by `tsrs` 0.20.1 running the mapper over `packages/vue-phaserjs`, `packages/genshin-interface` and `packages/genshin-world` with no `TS18069`.

## 2. Decide the compiler the Vue checks run on

- [ ] 2.1 Choose between moving `typescript` to the 7.1 beta and aliasing a second copy for the Vue packages, against the `scripts/` in-process uses. Verified by a recorded choice in `design.md`, replacing "The compiler for the proven path".
- [x] 2.2 Choose the pilot: one small package whose `typecheck` runs `vue-tsc` today and that has real `.vue` files, in place of `packages/vue-canvas-frame-headless`, which runs `tsrs` and has none. Verified by a recorded choice in `design.md`'s pilot paragraph: `packages/vue-phaserjs`.

## 3. Pilot one small Vue package

- [x] 3.1 Run `vize` through the chosen compiler on the pilot chosen in 2.2, and compare its diagnostics with `vue-tsc` on the same program. Verified by a diff of the two diagnostic lists recorded in `design.md`, empty on both the error set and the locations.
- [x] 3.2 Record any mismatch in `design.md` before the next package starts, and report upstream any mismatch that is a `vize` or `tsrs` defect. Verified by each mismatch appearing in `design.md` with its outcome.

## 4. Extend to the remaining Vue packages

- [x] 4.1 Run the same comparison on `packages/genshin-interface`, `packages/genshin-world` and `packages/vue-phaserjs`, each as its own commit. Verified by each package's diagnostic diff recorded in `design.md`.
  - `genshin-interface` is compared and its result is recorded in `design.md`.
  - `vue-phaserjs` is compared and clean (`tsrs` and `vue-tsc` both 0 diagnostics, diff empty) after the canvas mock cast in `src/test/setupCanvas.ts`.
  - `genshin-world` is compared and clean at `9d1bb6fc19` (`tsrs` exit 0 with 0 diagnostics, `vue-tsc` 6.0.3 exit 0 with 0 diagnostics, diff empty).

## 5. The `apps/web` Nuxt typecheck

- [x] 5.1 Decide whether `vize` replaces `nuxt typecheck` or runs beside it, in `design.md`, after reading how Nuxt generates its check inputs. Verified by a recorded decision with the spike's `apps/web` diagnostic diff.
  - The decision is recorded in `design.md` ("`apps/web` last"), with the per-file, per-location diff of the rerun on `vize` 0.637.0: `apps/web` stays on `nuxt typecheck`.

- [ ] 5.2 Triage the app's mapper diagnostics (`design.md`, "Landmines") into mapper defects reported upstream and real findings fixed in the app. Every class is reduced to a standalone project and listed in `design.md`, and the reports ready to file are drafts in this change's `reports` folder, written as the `todos` skill's `references/upstream-reports.md` says. Each draft carries a reduced `Foo`/`Bar` reproduction, the oracle's result, the cause in the vize source at its tag, a permalink to the real line in this repository, and the footer. They are filed on `ubugeeei-prod/vize` as one issue per bug and no tracking issue, in this order, each carrying the whole batch as a list in its Context with a marker on its own entry: `define-model-named-props` (#11359), `generic-script-alias-module-scope` (#11360), `nested-callback-implicit-any` (#11361), `component-is-vif-narrowing` (#11362), `dotted-component-tag-unlinked` (#11363), `declaration-rejects-fallthrough-attributes` (#11364), `declaration-emit-unused-generated-aliases` (#11365), `dynamic-component-generic-key-never` (#11366), `dynamic-component-select-event-type` (#11367), `global-generic-ref-exposed-empty` (#11368). No `@TODO` links them: no workaround waits on them, as the code stays as it is and the mapper's diagnostics are its own. `dynamic-component-generic-key-never` has its cause written up, the `never` being a deliberate witness; its second error, the slot check, is not reproduced outside vize, and its draft's `Not known` says so. Two observations have no draft because neither reduced: the `allowJs` failure of the `vue-phaserjs` declaration emit, and the `Search/Input.test.ts` cast (`design.md` records both). Re-run the `apps/web` comparison (task 5.2's check) once the filed issues are fixed, and update `design.md`. Verified by `tsrs --runExternalCode` over the app project reporting nothing that `nuxt typecheck` does not.
- [x] 5.3 Choose the declaration gate in `design.md`, "`.vue` declarations from `vize check --declaration`". Verified by the recorded choice there: the gate is a `vue-tsc`-checked consumer accepting the `vize` declarations, `apps/web` stays on `nuxt typecheck`, and 6.1 waits on the `declaration-rejects-fallthrough-attributes` fix rather than on the app.
- [x] 5.4 Bring the ten drafts in this change's `reports` folder to the section order of the `todos` skill's `references/upstream-reports.md`. Decided: the skill's order changes to match the minimal drafts. `Isolation` appears only when it shows which condition triggers the bug, and `Not known` only when something is, so a draft lists neither by default; every draft has a short `Not known`, and `Isolation` stays where a table found the trigger. Verified by the skill's section order and each draft's headings agreeing.
- [ ] 5.5 Settle the `vize` 0.639.0 re-run that `design.md` ("Newer releases change none of it") records just before filing. Its result is not in the filed drafts: `define-model-named-props`, the seven other mapper reports and the issues filed from them still state 0.638.0 as the newest tested release and say earlier versions are untested. Re-run the eight mapper reductions on 0.639.0 and keep its output in the change, then the owner decides whether the filed issues' Environment lines are amended to name 0.639.0. Until then `design.md` keeps the claim as the one filed text does not show. Verified by the recorded 0.639.0 output and the owner's decision on the filed issues.

- [ ] 5.6 Settle the two event-map gaps. The overload cap has a tested fix and a draft, `reports/event-map-overload-cap.md`, which names its checks and what they leave open. The runtime-array form is a separate defect with its own draft, `reports/runtime-array-emits-model-events.md`: a `defineEmits` array or object with a `defineModel` gives `TS2339` for each model, because the generator builds the event map and the handler props from `__vize_emits` alone (`generator/emits.rs:300` and `304`). Its fix is tested by changing those two lines in a copy of the native module, and a generic component with a runtime `defineEmits` is not tested. The owner files both. Re-run both on the newest release first, and decide the generic form. Verified by the two drafts in `reports` whose headings agree with the `todos` skill's section order.

## 6. `.vue` declarations without `vue-tsc`

- [ ] 6.1 Once `declaration-rejects-fallthrough-attributes` is fixed upstream, generate the declarations of the Vue packages' `.vue` files from `vize` (`vize check --declaration`) inside the shared tsdown configuration, in place of `dts.tsc.vue`. The gate and its reasons are the decision in `design.md`, "`.vue` declarations from `vize check --declaration`", and a byte match is not the bar. Verified by a dependent package's typecheck passing through both `vue-tsc` and the mapper against a package built with the `vize` declarations, with that package's size snapshot read and accounted for.

## 7. Retire `vue-tsc` and the override

- [ ] 7.1 Remove `vue-tsc` from every Vue package once each one's comparison has passed. `apps/web` keeps `vue-tsc` through `nuxt typecheck`, so the `typescript-native-bridge` override stays with it (`design.md`, "`apps/web` keeps `vue-tsc` regardless"). Verified by the workspace typecheck passing through the package scripts, and `pnpm ai:dependencies:score` showing `apps/web` as the only `vue-tsc` dependent.
- [ ] 7.2 Rewrite `openspec/specs/architecture/monorepo-tooling/design.md`'s "TypeScript compiler" section as built, and archive this change. Verified by `pnpm exec openspec validate architecture-vize-vue-typecheck --strict --no-interactive`.
