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

- [ ] 5.2 Triage the app's mapper diagnostics (`design.md`, "Landmines") into mapper defects reported upstream and real findings fixed in the app. Done so far: the twelve first-pass classes were filed (#11359 to #11368, #11390, #11391) and are closed, eleven fixed in a release. The re-run on `vize` 0.652.0 left 15 diagnostics, each reduced to a standalone project with a draft in this change's `reports` folder (the table in `design.md`, "The comparison, run a fourth time"), and the two code-side causes are fixed in the app (`inlineFontFace.ts`, and `app/types/vize.d.ts` as a `@TODO` with no issue). What remains is the owner's: file the drafts on `ubugeeei-prod/vize`, one issue per bug and no tracking issue, each carrying the batch as a list in its Context with a marker on its own entry (the drafts hold `<batch list filled in when filed>`), then delete each draft and link its issue in `design.md`, and replace the `todos` row for `app/types/vize.d.ts` with the link. Re-run the `apps/web` comparison once they are fixed. Verified by `tsrs --runExternalCode` over the app project reporting nothing that `nuxt typecheck` does not.
- [x] 5.3 Choose the declaration gate in `design.md`, "`.vue` declarations from `vize check --declaration`". Verified by the recorded choice there: the gate is a `vue-tsc`-checked consumer accepting the `vize` declarations, `apps/web` stays on `nuxt typecheck`, and 6.1 waits on the `declaration-rejects-fallthrough-attributes` fix rather than on the app.
- [x] 5.4 Bring the ten drafts in this change's `reports` folder to the section order of the `todos` skill's `references/upstream-reports.md`. Decided: the skill's order changes to match the minimal drafts. `Isolation` appears only when it shows which condition triggers the bug, and `Not known` only when something is, so a draft lists neither by default; every draft has a short `Not known`, and `Isolation` stays where a table found the trigger. Verified by the skill's section order and each draft's headings agreeing.
- [x] 5.5 Settle the `vize` 0.639.0 re-run that `design.md` recorded just before filing. Superseded: every issue is closed, and the reductions were re-run on 0.650.0, and the app, the three Vue packages and the fallthrough case on 0.652.0 (`design.md`, "The comparison, run a fourth time"), the raw output kept out of the repo. Whether the closed issues' Environment lines are amended is the owner's. Verified by the recorded result.

- [x] 5.6 Settle the two event-map gaps. Both are filed as one batch of two on `ubugeeei-prod/vize`: #11390, the overload cap, with a tested accumulator fix, and #11391, a runtime `defineEmits` with a `defineModel`, with a tested fix that builds the map and the handler props from `Emits`. Both reproduce on the newest release, 0.645.0, and the drafts in `reports` are the issues' text. The fixes are tested by editing the helper file and two generated lines in copies of the shipped package, so vize's own tests did not run on them, and Vue 2 mode and releases older than 0.463.0 are not tested. A runtime component with more than 16 events needs both fixes. Revisit both when `vize` is next bumped. Verified by the two issues and the two drafts in `reports`, whose headings agree with the `todos` skill's section order. The two drafts are retired with the other filed ones; both issues are closed.

## 6. `.vue` declarations without `vue-tsc`

- [ ] 6.1 Blocked: `declaration-rejects-fallthrough-attributes-with-emits` (the reduction that fails; #11364 is closed but not fixed) is open to file; #11364 is not fixed on 0.652.0 for a producer with an emit or two required props (`design.md`, "The comparison, run a fourth time"). Once it is fixed upstream, generate the declarations of the Vue packages' `.vue` files from `vize` (`vize check --declaration`) inside the shared tsdown configuration, in place of `dts.tsc.vue`. The gate and its reasons are the decision in `design.md`, "`.vue` declarations from `vize check --declaration`", and a byte match is not the bar. Verified by a dependent package's typecheck passing through both `vue-tsc` and the mapper against a package built with the `vize` declarations, with that package's size snapshot read and accounted for.

## 7. Retire `vue-tsc` and the override

- [ ] 7.1 Remove `vue-tsc` from every Vue package once each one's comparison has passed. `apps/web` keeps `vue-tsc` through `nuxt typecheck`, so the `typescript-native-bridge` override stays with it (`design.md`, "`apps/web` keeps `vue-tsc` regardless"). Verified by the workspace typecheck passing through the package scripts, and `pnpm ai:dependencies:score` showing `apps/web` as the only `vue-tsc` dependent.
- [ ] 7.2 Rewrite `openspec/specs/architecture/monorepo-tooling/design.md`'s "TypeScript compiler" section as built, and archive this change. Verified by `pnpm exec openspec validate architecture-vize-vue-typecheck --strict --no-interactive`.
