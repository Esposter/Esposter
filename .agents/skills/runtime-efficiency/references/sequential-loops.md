# Sequential loops

Read when `no-await-in-loop` reports, or when writing a loop that awaits. `SKILL.md` holds the rule — independent work
overlaps and a sequence must justify itself; this page is the justifications that hold, so a directive's reason names
one of them rather than arguing afresh.

The rule comes from oxlint's `perf` category, which is on — nothing in `oxlint.config.ts` names it — and it reaches
suites and benches too: a suite's wall time is the one every run of it pays. A loop it reports is either converted or
carries `// oxlint-disable-next-line no-await-in-loop -- <shape>: <why here>`. In a suite, setup a later step reads (a
row created before the one that references it) is the "each step reads the last" shape; a loop of independent
fixtures is converted like any other.

## Convert — the iterations are independent

Map the set to promises and `await Promise.all(...)`. The shape is independent when no iteration reads what an earlier
one wrote and nothing depends on the order they land in:

- **A write per element of one set** — each row, blob or file stands alone. Validate the whole set first when a bad
  element must stop every write (`loadFilesSource` checks every path before writing any).
- **A read per candidate, answered by any hit** — the scans run together and the answer is whether one matched
  (`resolveIdentifiedToken`).
- **Batches that do not read each other** — `generateProgramParticipants` sends its transactions together; each
  batch's own fallback stays inside it.
- **One call when the API takes the set** — a call that accepts many inputs answers them in one pass, and a
  `Promise.all` of thousands of heavy calls holds every one in memory at once (the template suite's UnoCSS checks ran
  out of heap until each became one `generate` over a `Set`).
- **Keep the result order explicitly** — `Promise.all` returns in input order, so collect results and write them in
  that order rather than pushing from inside each callback.

## Keep — a real dependency between iterations

| Shape                    | Why it stays sequential                                                                                     | Example                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Retry                    | The next attempt exists only because the last one failed                                                    | `updateEntityConditionally`, `createCallSessionId`, the invite id |
| Pagination               | The next page's cursor or offset is the last page's answer                                                  | the message catch-up, the CSV export                              |
| Committed prefix         | A failure must stop the chunks behind it, and everything before it stays durable for a redelivery to resume | `publishBlobDeletion`, the dead-letter replay                     |
| Order is the contract    | The iterations land in an order something else reads                                                        | new messages entering the list, SQL statements of a migration     |
| Lock order               | Rows are locked in a sorted order so two transactions cannot deadlock                                       | `releaseStorageLedgerEntriesByWhere`                              |
| Each step reads the last | An iteration's check or input is what the ones before it wrote                                              | adding direct-message participants, a topological deploy          |
| Stop at the first        | The loop ends at the first iteration that answers, and the rest must not run                                | an interaction handler that consumes the input                    |
| Bounded concurrency      | A pool or a wave is the concurrency, set by a constant, and each worker takes one task at a time            | the registry pool, `deleteDirectory`'s waves, `settleAll`         |
| Async iteration          | An async generator yields in order, and a stream is read chunk by chunk                                     | the Azure mocks' listings, a response body reader                 |
| One device               | The work shares a resource that runs one job at a time                                                      | voice synthesis on the GPU, audio playback                        |

**A count is not a reason.** "There are only a few" makes a sequence cheap, not correct, and the rule exists so the
next caller does not have to measure it again — convert it.
