# Tasks

## 0. Verification before build

Each task here records its outcome in the design's Verification section. No task in sections 1 to 5 starts before its outcome is recorded.

- [ ] 0.1 Read the two SQLite pages on triggers and generated columns, check that D1 runs a trigger and a multi-statement trigger body through a migration, both locally and remotely against a scratch database, and record the outcome. The outcome decides whether the triggers in section 1 are built or the write path recomputes the targets. Verified by the design listing the D1 outcome, and by the scratch database check's output recorded with the change.
- [ ] 0.2 Check whether a foreign-key cascade fires the child's delete trigger in packages/db-mock, and record the outcome. Task 2.3 builds the account-erase path on it. Verified by the check's output recorded with the change and the design listing the outcome.
- [ ] 0.3 Compare the database's math functions with the ranking definition on the sampled grid, and record whether the ranking is a stored generated column or a batch recompute. Task 3.1 builds the chosen storage. Verified by the parity output recorded with the change and the design listing the outcome.
- [ ] 0.4 Check whether drizzle-kit's snapshot ignores triggers, and record whether the generator appends them to each migration. Verified by the snapshot check's output recorded with the change and the design listing the outcome.
- [ ] 0.5 Find each reader that treats updatedAt as an edit marker in apps/web and apps/jobs, record each in the design, and fix it so a count leaves that column alone. Verified by the search output recorded with the change and each fixed reader's test passing.

## 1. Triggers

- [ ] 1.1 Write the trigger template for a count or a sum over a foreign-key relation and over an ancestor-list relation, and the generation check that compares the database's triggers with the template. Write the database test first, holding "A revived vote moves the count of its post by its value", "A removed comment lowers every post above it by the comments it removed" and "A change to the key column of a relation is refused" each seen failing before the template exists. Verified by the test passing under `pnpm -C packages/db-mock exec vitest run` and the generation check failing on an edited trigger.
- [ ] 1.2 Raise the target's version in the trigger and leave its update time alone, and guard the self-firing update with the `WHEN` clause. Write the test first, holding "A moved count raises the version of its post" and "A moved count leaves the update time of its post unchanged", and see both fail first. Verified by those tests passing, and by the self-update test confirming the replies' counts do not change.

## 2. Writes

- [ ] 2.1 Remove the count arithmetic from the vote and comment writes and answer each with the derived values it changed. Write the router tests first, holding "A refused vote moves no count" and "A refused vote answers with its error and no derived values", and see them fail on the current arithmetic. Verified by the router tests passing under `pnpm test server/trpc/routers/like.test.ts server/trpc/routers/post.test.ts --run` from `apps/web`.
- [ ] 2.2 Answer each vote and comment with the post's counts at the version its batch left them, read as the batch's last statement. Write the test first, holding "A vote answers with the counts of its post at the version the vote moved them to". Verified by that test passing.
- [ ] 2.3 Build the account-erase path on the cascade outcome of 0.2, so that the erase leaves every count and ranking right without the account job. Write the test first, holding "An account erase leaves every aggregate at its recomputation", and see it fail first. Verified by apps/jobs/src/handlers/deleteAccountHandler.test.ts passing under `pnpm -C apps/jobs exec vitest run`.
- [ ] 2.4 Add the lint selector that refuses an update to a derived key outside the helper module, fed by the generated set, in the same change that removes the arithmetic it guards. Write the lint fixture first, holding "A set of a derived key outside the helpers is refused by lint", and see the fixture pass lint before the selector exists. Verified by the fixture being refused by the selector, and by the selector's test passing under `pnpm -C scripts exec vitest run`.

## 3. Ranking

- [ ] 3.1 Build the ranking storage that 0.3 chose: a stored generated column, or a recompute in the write. Remove the separate ranking statement and the account job. Write the tests first, holding "A ranking follows its vote in the same write" and "The stored ranking equals the ranking definition on the sampled grid", and see them fail first. Verified by both passing, and by the change's record stating which storage the parity check chose.

## 4. Read

- [ ] 4.1 Replace the post count read with the generic read by table and keys, chunked at the cap, and move the post count store to it. Write the test first, holding "A read of more keys than the cap is answered in chunks" and "A key that matches no row is answered with nothing". Verified by those tests passing under `pnpm test app/store/post/count.test.ts --run` from `apps/web`.

## 5. Checks

- [ ] 5.1 Add the random-sequence test over the routers, holding "A random sequence of votes and comments leaves every aggregate at its recomputation", seen failing against the arithmetic it replaces. Verified by the test passing on the sequence the generator draws.
- [ ] 5.2 Write the migration that adds the triggers and the ranking, with the parity query run before the rebuild and the recompute run once. Verified by the migration's own guard stopping on a parity mismatch, the recompute's output recorded with the change, and the scenarios "A drifted count is corrected by the recompute" and "A correct count is left unchanged by the recompute" shown by that output.
