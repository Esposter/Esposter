# Partition and Row Keys

Read when designing a table's keys, generating a `rowKey`, or decoding one back to its timestamp.

## Partition and row key design

- **`partitionKey` = the owning room id** — `AzureTable.Messages`, `AzureTable.MessagesAscending`, `AzureTable.ModerationLog` all partition by `roomId`. Entity factories take `roomId` and assign it to `partitionKey` (`createMessageEntity`); a transaction can only span one partition, so this is also what makes room-scoped batch writes legal.
- **`rowKey` = `getReverseTickedTimestamp()`** — Azure Table sorts rows within a partition by `rowKey` ascending only, so a reverse-ticked key makes a plain scan return **newest-first** with no sort.
- **`AzureTable.MessagesAscending`** mirrors each message with the tick un-reversed as its `rowKey` (same `partitionKey`) to get oldest-first ordering — see `createMessage` in `@esposter/db`.

## Reverse-ticked timestamps

`getReverseTickedTimestamp(timestamp = now())` (`@esposter/db-schema`) returns `AZURE_SELF_DESTRUCT_TIMER - timestamp`, parsed through `reverseTickedTimestampSchema` so it is the branded `ReverseTickedTimestamp` every rowKey field declares (the `absent-values` skill, `references/sentinel-propagation.md`), where `now()` (`@esposter/shared`) is epoch **nanoseconds** and `AZURE_SELF_DESTRUCT_TIMER` is a run of nines (`packages/db-schema/src/services/azure/table/constants.ts`).

- **It is its own inverse** — `getReverseTickedTimestamp(rowKey)` maps a stored `rowKey` back to the real timestamp, and vice versa. That's how cursors and the ascending-table mirror are built; never hand-roll the subtraction.
- Never generate a `rowKey` with `Date.now()` or an ISO string — millisecond resolution collides under load, and lexical ISO sorts oldest-first.
- **Nanosecond resolution is what the bare timestamp relies on, and nothing more.** `now()` reads the platform clock, `performance.timeOrigin` plus `performance.now()`, which a window, a worker and Node all have, and steps a reading that lands on or before its last answer one past it. Two writes to one partition in one process never share a key, and two processes collide only when they read the same nanosecond. The key staying exactly the timestamp is what lets cursors and the ascending mirror decode it back. A colliding write is a `createEntity`, which Azure rejects with a `409` rather than overwriting, so a collision fails the write loudly and never overwrites another row; a suffix that made keys unique would also make them undecodable.
- **A test that fakes timers keeps its keys distinct** — a frozen clock makes `now()` step one nanosecond a call, so rows written to one partition keep their order (`testing` skill, `references/timers-and-hand-resolved-promises.md`).
