# Tasks

## resource/resource-save-state

- [x] Write the regression tests in `apps/web/app/store/resource/` for "A queued save of a closed resource is refused after another device saved" and "A row read from another device does not raise the version a save carries". Verify: the tests are written first and seen failing with `pnpm test <file> --run` from `apps/web`, sending the held row's version.
- [x] Add the per-resource confirmed-version map and read it in the `sent` pair for every resource, not only the loaded one, so both scenarios pass. Verify: the regression tests pass, and the existing `saveContent` tests in the same folder still pass.
- [x] Drop the map entry once its resource is neither loaded nor saving: in `clearResource` and when a save of it settles. Verify: the two call sites are read against that rule. The map is private to the store and nothing reads it back, so no test can observe a leftover entry without a test-only accessor, which is not added.
- [x] Update `openspec/specs/resource/resource-save-state/design.md` with the stale-refusal rule for an unloaded save, and archive this change into the specs. Verify: `pnpm test src/workspace/docs/openspecScenarioTasks.test.ts src/workspace/docs/openspecValidate.test.ts --run` from `scripts` passes.
