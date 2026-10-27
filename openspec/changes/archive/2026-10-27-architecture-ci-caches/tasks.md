# Tasks

## 1. Write the guard

- [x] 1.1 Write `scripts/src/workspace/ciCaches.test.ts` asserting that no workflow or action uses the combined cache action, that the pnpm store's own cache is off, and that every cache save carries the default-branch-and-`ai/queue` condition. Verified by seeing all three fail against the workflows before the fix.

## 2. Save from two branches

- [x] 2.1 Key the pnpm store on the lockfile in `setup-project-dependencies`, restoring it on every branch.
- [x] 2.2 Save the store from `install-projects` only on a miss, and only from the two branches. Verified by the guard passing and by the ai/queue CI run's save and restore log lines.
- [x] 2.3 Gate the vp task-cache save in `run-cached-task` on the same condition.
- [x] 2.4 Make the game-data mirror restore on every branch and fill and save it only on the two branches in `build-packages`. Verified by the guard passing and by `pnpm -s vp run lint:workflows` passing.

## 3. Record the rule

- [x] 3.1 Write `openspec/specs/architecture/ci-caches/design.md` as built, and point `monorepo-tooling` and `hosted-game-data` at it.
- [x] 3.2 Delete the caches the repository held before the change, so the rule starts from an empty store.
