# Optimistic overlay tasks

Ordered by dependency: the primitive first, then the schema the pilot needs, then the pilot, then each store group with its deletions, then the retirement of the primitive's bookkeeping, the enforcers and the specs. Each task names how it is verified: a test written first and seen failing, or a command with its expected output. A migration is a one-time job, so it is verified by the guard inside it and its output, not by a test.

## 1. Primitive (architecture client data)

- [ ] 1.1 Arrival gate: held state takes an arrival only when nothing is held for its key or its version is greater. Verified: cases in the primitive's test file, written first and seen failing, that an older arrival after a newer one leaves the held row, an equal arrival changes nothing, a tombstone removes, absence removes nothing, and a client placeholder accepts a version-zero arrival.
- [ ] 1.2 App-scoped write registry: a queue per entity key, nested by table and then by key value, shared across every instance of the app. Verified: a case in the primitive's test file, written first and seen failing, that two instances writing one row run one at a time, and two writes on unrelated rows run concurrently.
- [ ] 1.3 Entries and view: a pending entry applies over held state, a response confirms it at the versions it names, it drops once each confirmed key is held at or above its version, and a failure drops it with held state untouched. Verified: cases written first and seen failing that a failed entry leaves the view equal to held state, and a confirmed entry stays until its arrival.
- [ ] 1.4 Run scope: a new run in a scope aborts the run before it, and only the newest run commits. Verified: a case written first and seen failing that an aborted run commits nothing and an older run's result is not applied.
- [ ] 1.5 Type enforcement: a write's options take entity keys and an entry with no rollback member, ingest accepts only versioned rows, and the view is readonly. Verified: a type test beside the primitive's test file, written first and seen failing on a rollback option.

## 2. Schema (architecture cloud services)

- [ ] 2.1 Version definition: one function spread by the D1 wrapper and by each object schema, so every table gets the column. Verified: generating the migration with the drizzle skill's command prints one add-column statement per table, and no other change.
- [ ] 2.2 Migration: the version column is added to every table, as a not-null integer with a default of zero. Verified: the migration's guard query, run on dev, returns zero rows with no version, and the run output names every table it changed.
- [ ] 2.3 Raw write scan: no statement writes a tracked table outside the Drizzle builder. Verified: a grep of the server and package sources for raw update and delete statements on the tracked tables prints nothing, or each hit is routed through the builder in the same task.
- [ ] 2.4 Mutation header: the middleware that appends the topics header also answers mutations, with the key and version of each tracked row the write changed. Verified: a case in the middleware's test file, written first and seen failing, that a mutation's header names the versions of the rows it changed.

## 3. Pilot (esbabbler friends and direct messages)

- [ ] 3.1 Verify the key types: the entity key's type takes a table's primary key from its select model, and a composite key's columns are named explicitly. Verified: a type test over the friendship and block tables, written first and seen failing where the composite key is inferred wrongly.
- [ ] 3.2 Regression tests for the three races against the current rollbacks: the unfriend after a block re-adds a friend, and the two other races the pair executor fixed. Verified: the three cases in the friend, block and request store tests, written first and seen failing against the current code. This is the proof run, and it lands before the fix.
- [ ] 3.3 Pair tables soft-deleted with revival: unfriend, accept, decline, block, unblock and send become tombstone writes, and revival is an upsert whose conflict branch clears the deletion. Verified: router cases in the friend router test, written first and seen failing, that a removed friendship returns a tombstone with a version and that a re-created one is revived with a higher version.
- [ ] 3.4 Live filters: every server statement that decides from the pair tables filters live rows, and every client read returns tombstones within its scope. Verified: the router tests fail when a removed friendship still counts as a friend, with the cases written first.
- [ ] 3.5 Pilot stores on entries and arrivals: the friend, block and request stores use entity keys, entries and arrivals, and the pair executor export, the mirror functions, the replay calls and the rollback closures are deleted in the same change. Verified: the three store test files pass, and a grep of those three store files for the deleted names prints nothing.
- [ ] 3.6 Pilot measurements: round trips per write before and after, a benchmark of one view recompute over a page with three pending entries, and the latency of a camera toggle waiting behind a mute on one row. Verified: the three numbers are recorded in the pilot's commit body before the groups start.

## 4. Remaining stores, by folder

- [ ] 4.1 Membership and category tombstones: the membership and room category tables gain soft deletion and revival before their stores move. Verified: the router cases written first and seen failing, as in 3.3.
- [ ] 4.2 Room stores: the membership, role, category, emoji, invite, webhook, direct message and realtime stores, and the call participant store, move to entries and arrivals, and their executors and replay calls are deleted. The refresh of room users applies user rows one by one, and the virtual background pipeline becomes a run scope with one commit. The replay module, its merge function and its push type are deleted here, since this is their last caller. Verified: the store test files of each store pass, and a grep of the room folder for the deleted names prints nothing.
- [ ] 4.3 Other message stores: user settings, ban, member, status, app user, thread follow, pin, drafts, scheduled jobs and the rest of the message folder move to versioned arrivals, and their supersede calls are deleted. Verified: their store test files pass, and a grep of the folder for supersede prints nothing.
- [ ] 4.4 Resource, post, survey and dashboard stores: each moves to arrivals, and the dataset binding pick becomes a run scope. Residue reads that no version covers stay on the run scope and are named in the group's commit body. Verified: the store test files of the group pass, and the binding's test shows a second pick aborts the first.
- [ ] 4.5 Root stores and the page-builder and editor stores: the storage meter stores the user row's arrival, and the cache's supersede method is deleted. Verified: the storage store test passes with a pushed total applied at its version, and a grep of the root stores for supersede prints nothing.

## 5. Retire the primitive's bookkeeping

- [ ] 5.1 Delete the call-id map and its getter, the supersede function, the supersede write option, the stale argument threaded through reads and writes, the stale and silent branches in settlement, the stale fields in the operation context, and the stale outcome. Verified: a grep of the apps and packages sources for each name prints nothing, and the primitive's test file has no stale case.

## 6. Enforcers

- [ ] 6.1 Lint selector: an entry's apply that assigns a ref fails lint. Verified: a fixture in the eslint fixture suite, written first and seen failing, then the selector passes it.
- [ ] 6.2 Wake check: a write's declared keys must cover the rows its recorded write set names. Verified: a fixture write that omits a key fails the wake check, written first and seen failing.

## 7. Specs and skills

- [ ] 7.1 Owning sections: client data (optimistic apply, rollback, concurrency and live reads), async operations (writes, reads and outcomes), cloud services (the version column, tombstones and the header), friends and direct messages (the replay paragraph), and the offline cache (held state with versions) are rewritten to the overlay, and the spec deltas for the four capabilities are added so skip_specs is removed. Verified: the openspec validate command passes with strict checking, and the scripts' scenario test passes for this change.
- [ ] 7.2 Skill sweep: the pinia, vue composable patterns, testing and drizzle skills drop the rollback guidance and state the version and tombstone rules. Verified: a grep of the skills and the ledgers for the deleted names returns only archive entries.
- [ ] 7.3 Archive: once the groups in 3 to 6 have shipped, the change is archived with its deltas merged. Verified: the archive command's output names each merged capability.
