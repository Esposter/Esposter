# Optimistic overlay tasks

Ordered by dependency: the primitive first, then the schema the pilot needs, then the pilot, then each store group with its deletions, then the retirement of the primitive's bookkeeping, the enforcers and the specs. Each task names how it is verified: a test written first and seen failing, or a command with its expected output. A migration is a one-time job, so it is verified by the guard inside it and its output, not by a test.

## 1. Primitive (architecture client data)

- [x] 1.1 Arrival gate: held state takes an arrival only when nothing is held for its key or its version is greater. Verified: cases in the primitive's test file, written first and seen failing, that an older arrival after a newer one leaves the held row, an equal arrival changes nothing, a tombstone removes, absence removes nothing, and a client placeholder accepts a version-zero arrival.
- [x] 1.2 Recording view: the registry runs each optimistic entry once when it is queued, against a recording view of held state, and records each table and key the entry reads or writes. Verified: a case in the primitive's test file, written first and seen failing, that the recorded keys are the rows the entry touches and that the entry's result is discarded.
- [x] 1.3 Queue by touched key: writes whose recorded keys overlap run one at a time across every instance of the app, and writes whose keys do not overlap run concurrently. No call names a key. Verified: cases written first and seen failing that two instances writing one row serialise, and two writes on unrelated rows do not wait for each other.
- [x] 1.4 Keyed view without iteration: an entry reads and writes rows by key only, so the view offers no iteration, count or search. Verified: a type test, written first and seen failing, that the entry's view has no iteration member, and a case that an entry's touched keys are the same on two states that differ in other rows.
- [x] 1.5 Entries and view: a pending entry applies over held state, a response confirms it at the versions it names, it drops once each confirmed key is held at or above its version, and a failure drops it with held state untouched. Verified: cases written first and seen failing that a failed entry leaves the view equal to held state, and a confirmed entry stays until its arrival.
- [x] 1.6 Awaited writes take no key: the arrival gate orders two awaited responses for one row. Verified: a case written first and seen failing that two responses for one row, arriving in reverse order, leave the higher version held.
- [x] 1.7 Run scope: a new run in a scope aborts the run before it, and only the newest run commits. Verified: a case written first and seen failing that an aborted run commits nothing and an older run's result is not applied.
- [x] 1.8 Type enforcement: a write's options take an entry and no key and no rollback member, ingest accepts only versioned rows, and the view is readonly. Verified: a type test beside the primitive's test file, written first and seen failing on a key or a rollback option.

## 2. Schema (architecture cloud services)

- [x] 2.1 Version definition: one function spread by the D1 wrapper and by each object schema, so every table gets the column. Verified: generating the migration with the drizzle skill's command prints one add-column statement per table, and no other change.
- [x] 2.2 Migration: the version column is added to every table, as a not-null integer with a default of zero, which is the insert value. Verified: the migration's guard query, run on dev, returns zero rows with no version, and the run output names every table it changed.
- [x] 2.3 Raw write scan: no statement writes a tracked table outside the Drizzle builder. Verified: a grep of the server and package sources for raw update and delete statements on the tracked tables prints nothing, or each hit is routed through the builder in the same task.
- [x] 2.4 Mutation header: the middleware that appends the topics header also answers mutations, with the key and version of each tracked row the write changed. Verified: a case in the middleware's test file, written first and seen failing, that a mutation's header names the versions of the rows it changed.

## 3. Pilot (esbabbler friends and direct messages)

- [x] 3.1 Keyed view types: each table's key value is typed from its primary key, and a composite key's levels are typed by its columns. Verified: a type test over the friendship and block tables, written first and seen failing where the composite key is inferred wrongly.
- [ ] 3.2 Regression tests for the three races against the current rollbacks: the unfriend after a block re-adds a friend, and the two other races the pair executor fixed. Verified: the three cases in the friend, block and request store tests, written first and seen failing against the current code. This is the proof run, and it lands before the fix.
- [x] 3.3 Pair tables soft-deleted with revival: unfriend, accept, decline, block, unblock and send become tombstone writes, and revival is an upsert whose conflict branch clears the deletion. Verified: router cases in the friend router test, written first and seen failing, that a removed friendship returns a tombstone with a version and that a re-created one is revived with a higher version.
- [x] 3.4 Live filters: every server statement that decides from the pair tables filters live rows, and every client read returns tombstones within its scope (the two user-list reads, `readFriends` and `readBlockedUsers`, return live users until 3.5 reads rows, as design.md's store section says). Verified: the router tests fail when a removed friendship still counts as a friend, with the cases written first.
- [ ] 3.5 Pilot entries in a shared module: the friend, block and request entries move to the shared folder, and the stores issue their writes without a key. The pair executor export, the mirror functions, the replay calls, the rollback closures and the pair helper at call sites are deleted in the same change. Verified: the three store test files pass, a grep of the three store files for the pair helper prints nothing, and the stability test passes for each pilot entry.
- [ ] 3.6 Pilot measurements: round trips per write before and after, a benchmark of one view recompute over a page with three pending entries, and the latency of a camera toggle waiting behind a mute on one row. Verified: the three numbers are recorded in the pilot's commit body before the groups start.

## 4. Remaining stores, by folder

- [ ] 4.1 Membership and category tombstones: the membership and room category tables gain soft deletion and revival before their stores move. Verified: the router cases written first and seen failing, as in 3.3.
- [ ] 4.2 Category create position: the create computes its position inside its insert statement, so no client queue is needed for it. Verified: a router test, written first and seen failing against the read-then-insert form, that two concurrent creates through the router get distinct positions.
- [ ] 4.3 Room stores: the membership, role, category, emoji, invite, webhook, direct message and realtime stores, and the call participant store, move to entries and arrivals, and their executors and replay calls are deleted. The category executor goes once 4.2 has landed. The refresh of room users applies user rows one by one, and the virtual background pipeline becomes a run scope with one commit. The replay module, its merge function and its push type are deleted here, since this is their last caller. Verified: the store test files of each store pass, and a grep of the room folder for the deleted names prints nothing.
- [ ] 4.4 Other message stores: user settings, ban, member, status, app user, thread follow, pin, drafts, scheduled jobs and the rest of the message folder move to versioned arrivals, and their supersede calls are deleted. Verified: their store test files pass, and a grep of the folder for supersede prints nothing.
- [ ] 4.5 Resource, post, survey and dashboard stores: each moves to arrivals, and the dataset binding pick becomes a run scope. Residue reads that no version covers stay on the run scope and are named in the group's commit body. Verified: the store test files of the group pass, and the binding's test shows a second pick aborts the first.
- [ ] 4.6 Root stores and the page-builder and editor stores: the storage meter stores the user row's arrival, and the cache's supersede method is deleted. Verified: the storage store test passes with a pushed total applied at its version, and a grep of the root stores for supersede prints nothing.

## 5. Retire the primitive's bookkeeping

- [ ] 5.1 Delete the call-id map and its getter, the supersede function, the supersede write option, the stale argument threaded through reads and writes, the stale and silent branches in settlement, the stale fields in the operation context, and the stale outcome. Verified: a grep of the apps and packages sources for each name prints nothing, and the primitive's test file has no stale case.

## 6. Enforcers

- [ ] 6.1 Lint selector: an entry that iterates the keyed view or assigns a ref fails lint. Verified: a fixture in the eslint fixture suite, written first and seen failing, then the selector passes it.
- [ ] 6.2 Wake check cross-check: each optimistic write's touched keys cover the rows its recorded write set names, run against the state its server test seeds. A gap is a finding that the entry does not show a changed row. Verified: a fixture entry that omits a written row fails the wake check, written first and seen failing.

## 7. Specs and skills

- [ ] 7.1 Owning sections: client data (optimistic apply, rollback, concurrency and live reads), async operations (writes, reads and outcomes), cloud services (the version column, tombstones and the header), friends and direct messages (the replay paragraph), and the offline cache (held state with versions) are rewritten to the overlay, and the spec deltas for the four capabilities are added so skip_specs is removed. Verified: the openspec validate command passes with strict checking, and the scripts' scenario test passes for this change.
- [ ] 7.2 Skill sweep: the pinia, vue composable patterns, testing and drizzle skills drop the rollback guidance and state the version, tombstone and touched-key rules. Verified: a grep of the skills and the ledgers for the deleted names returns only archive entries.
- [ ] 7.3 Archive: once the groups in 3 to 6 have shipped, the change is archived with its deltas merged. Verified: the archive command's output names each merged capability.
