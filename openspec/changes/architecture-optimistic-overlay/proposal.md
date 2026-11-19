# Optimistic overlay

Replace per-instance rollbacks and hand-kept staleness bookkeeping with one server-versioned overlay, so that no write restores an older value and no caller orders its own async work.

## Why

Client writes race. Each `useMutation()` instance owns its own queue, so two components writing the same row do not serialise. Each fix so far moved one writer by hand onto a shared executor, and a new writer can forget to join. Rollbacks are hand-written inverse closures with compare guards, and a late rollback can write an older value over a newer one: the unfriend rollback re-added a friend after a block. Reads and writes are ordered by call ids and supersede, and replay pushes over reads, which is more hand-kept bookkeeping.

## What changes

- Optimistic state becomes an overlay. The store holds server truth, a pending write is an entry that applies a pure change over it, and the screen reads truth with the pending entries applied. A failed entry is dropped, and a confirmed entry is dropped once the server's version of each row it changed has arrived. No rollback closure exists.
- Every row carries a `version` the database raises on each change. An arrival applies only when its version is newer than the one held, so a late read, an out-of-order event or a superseded response loses by construction. Call ids, supersede and push replay go.
- Pair rows (friendships, requests and blocks) become soft-deleted tombstones with revival, so a removal is an arrival that carries a version.
- Write queues move into one app-scoped registry. Each write is queued by the rows its optimistic entry touches, found by running that entry once, so no writer names a queue key. Awaited writes take no key, since the version gate orders their responses. This replaces one queue per `useMutation()` instance.
- Client-side work with no version, such as the virtual background pick, takes a run scope that aborts the run before it.
- Migration is group by group, with the pilot on the friend, block and friend-request stores. Each group deletes the hand executors and rollback guidance it replaces in the same change.

**BREAKING.** The pair procedures return tombstones and versions, the write options lose `applyOptimistic` and `checkIsStale`, and `MutationStatus.Stale` is removed. Stores and their clients ship together, so no compatibility path is kept.

## Capabilities whose behaviour changes

- `architecture/client-data`: the optimistic apply, rollback, concurrency and live-read rules.
- `architecture/async-operations`: targets, latest-wins reads, the outcome set and the write queue.
- `architecture/cloudflare-services`: the version column, tombstones and the mutation header.
- `esbabbler/friends-and-dms`: the pair rows and their replay paragraph.

This commit is documentation only, so the change carries no spec delta yet. The pilot adds the deltas for these capabilities when its behaviour ships, and the design records each one.

## Size

The tasks run past the twelve-task guideline in the change rules. The owner asked for the whole migration as one design, with the primitive, the pilot, every store group and the deletions in one change, so the size is accepted here. Splitting would leave the deletions of each group without their primitive.

## Out of scope

The message send path keeps its own optimistic flow, as the client data design says. Game saves stay read once and never go live. Counts stay on the batched re-read. Navigation and dialog reactions to a failure stay with their call sites, since they are UI effects and not state.
