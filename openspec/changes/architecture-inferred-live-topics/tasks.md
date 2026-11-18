# Tasks

## 1. Scope declaration and the read side

- [x] 1.1 Add the scope declaration to `sqliteTable` and declare scope columns on each table the five reads and the hand declarations name, marking the invite id secret. Verified by a scope test that every declared scope column exists on its table, seen failing before the declaration exists and passing after.
- [x] 1.2 Walk a built query's read set: its tables, scope equalities, join keys, null checks, correlated subqueries, set-operator operands and relational aliases. Verified by golden read-set tests of the five reads written first and seen failing, including the direct-message partner read, whose join key must come from the selected key and not from a same-named column.
- [x] 1.3 Record each awaited top-level statement through a request-scoped handle over the context's `db`, including the statements of `db.batch`. Verified by a test that records a relational query, a batch and a `$count`, seen failing first, and a check that no drizzle class is patched.

## 2. Write side and the match

- [x] 2.1 Capture a write's set from its `RETURNING` scope columns for insert, update, delete, upsert and batched statements, adding the cascading children's table-wide topics from the foreign-key graph and digesting secret values. Verified by write-set tests per statement kind, including a resource delete that must name its twelve cascading child tables, seen failing first.
- [ ] 2.2 Test the match and the coverage: every query procedure's read set covers every table its query touches, and each write's publish set matches the read set of each query over the rows it changed, in one router-wide test that replaces the per-procedure topic assertions. Verified by that test failing on the bookmark dock before its declaration is migrated.

## 3. Router migration, pushed as one sequence

- [ ] 3.1 Migrate the dock, room, invite, friend, friend request, block, bookmark and post routers: delete each hand declaration and its topic assertions, and keep each router's coverage test green. Verified by `getTopicsProcedure` no longer appearing in those files and the router-wide test passing.
- [ ] 3.2 Migrate the remaining routers, including like, message, notification, webhook, resource, blueprint, dataset, achievement, clicker, dungeons, genshin, call and scheduled messages, in the same way, keeping each `staticReason` as a classification. Verified by no `getTopicsProcedure` call remaining in `apps/web/server` and the router-wide test passing.
- [ ] 3.3 Delete the two client re-reads the inference covers: the member re-read in the `updateUserToRoom` subscribable, and the direct-message participant re-read in the list and the `joinRoom` handler, with the participants folded into the list procedure's resolver so its read set collects them. Verified by a member-store test that another client's display-name write refreshes the member with no `readUsersByIds` request from the subscribable, and a direct-message list test that a new participant's join refreshes the participants with no second request; each seen failing before its re-read is deleted.

## 4. The editor content read

- [ ] 4.1 Publish a content blob's key on each write to it, and have the content watch read the resource row's `contentHash` before the blob, so the editor applies only a changed hash; then remove the `saveResourceContent` event, or record the content read as the documented exception if the guard is not built. Verified by a test that an editor's own save applies nothing on the watch, and a driven-browser run of the open editor confirming the document is not re-applied.

## 5. Cutover

- [ ] 5.1 Delete `getTopicsProcedure`, its `getTopics` callbacks, the `topics` meta flag and `getTopic` for declarations, and every hand topic assertion, as the last commit of the sequence. Verified by a grep finding none of them in `apps/web` and the touched packages' test suites passing.

## 6. Measurement and the policy decision

- [ ] 6.1 Measure, in a deployed Worker, the subscriptions per page, the publishes per write, each table-wide topic's fan-out and the walk's CPU, against the baseline in the design; decide the join policy and each table whose table-wide topic fans out too far, and record the numbers in the design. Verified by the measured table in the design and the decisions it names.

## 7. Specs

- [ ] 7.1 Rewrite the "Live reads" section of the client-data design and the topic section of the cloudflare-services design for the inferred mechanism, and archive this change with its spec deltas. Verified by `openspec validate` passing with the deltas and the archive moving the change into the specs.
