# Tasks

## resource/resource-save-state

- [ ] Write the regression tests in `apps/web/app/store/resource/` for "A queued save of a closed resource is refused after another device saved" and "A row read from another device does not raise the version a save carries". Verify: the tests are written first and seen failing with `pnpm test <file> --run` from `apps/web`, sending the held row's version.
- [ ] Add the per-resource confirmed-version map and read it in the `sent` pair for every resource, not only the loaded one, so both scenarios pass. Verify: the regression tests pass, and the existing `saveContent` tests in the same folder still pass.
- [ ] Clear the map entry when no save of that id is pending. Verify: a test that opens and closes a resource twice shows no entry left after the last save settles.
- [ ] Update `openspec/specs/resource/resource-save-state/design.md` with the stale-refusal rule for an unloaded save, and archive this change into the specs. Verify: `pnpm test src/workspace/openspecScenarioTasks.test.ts src/workspace/openspecValidate.test.ts --run` from `scripts` passes.
