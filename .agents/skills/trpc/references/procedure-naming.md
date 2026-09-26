# Procedure and Result Naming

Read when naming a procedure, a result type, a subscription or a DB result variable.

- **Every query names its verb** (`trpc-procedure/require-query-verb`): `read*` for a fetch, `search*` for a ranked query, `generate*` for a minted credential (a SAS entity, a Web PubSub access url). A bare noun (`buildVersion`) and a `get*` procedure are both wrong — `get*` is for derivation, which is not what a network round trip is.
- **A query answering with a count is a `read*Count`** — `readResourcesCount`, `readMembersCount`,
  `readResourceViewCount`, `readSurveyResponsesCount`. There is no second spelling: whether the caller drove the
  tally with filters or asked for a number belonging to one subject makes no difference to the name, because a
  reader cannot tell those apart and neither can the next author.
- **A grouping answers with rows rather than a number**, so it is plural and named for what it returns —
  `readResourceTagCounts`, `readMemberCountsByTopRole`, matching the `ResourceTagCount[]` /
  `MemberCountByTopRole[]` it hands back. No procedure is named `count*`; that prefix is a pure in-memory tally
  (`naming`), which is not a network round trip.
- **A named type for what a procedure answers with ends in `Result`** — `ReadInviteResult`, `JoinCallResult` — never `Output`, which is the same idea under a second name and leaves the tree with two spellings of one convention. The type is named for the procedure, so it renames when the procedure does.
- `upsert*` for procedures that do `insert().onConflictDoUpdate()` — never `update*` (update implies the record already exists). Domain operation names (`subscribe`, `connect`) are exempt.
- Subscription naming: `on` + exact mutation name (camelCase): `createFoo` → `onCreateFoo`.
- DB result variables named after the entity: `newFoo`, `updatedFoo`, `existingFoo` — never `created`, `updated`, `existing` (`id-denylist`).
