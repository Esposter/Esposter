# The `updateEntityConditionally` loop

Read when a write's body is computed from an entity the same request just read — a votes map, a `files` array a delete splices, any `"Replace"` of a full entity. Why the write must be conditional at all, and which reader supplies the etag, are below.

A caller supplies `getUpdateEntity` and `writeEntity`, and the helper does the rest:

- **Re-apply the intent to the version it re-read, never the body it started from.** This is what `getUpdateEntity(entity)` is for: it receives the fresh entity on every attempt. "Clear this field", "drop this file", "record this vote" all survive losing a race; the body computed against the version that moved does not. Replaying that body **is** the bug — for a `"Replace"` it reverts every concurrent change to the entity, not just the field the caller meant to touch.
- **A `"Replace"` is not exempt, it is the reason.** Merge cannot unset a property, so clearing one has to write the whole body — which is exactly the write that silently reverts a concurrent edit when it is unconditional.
- **Emit the delta, not the replaced body.** The subscription payload stays `{ linkPreviewResponse: null, partitionKey, rowKey }` so a client merges one property instead of adopting a whole entity it may hold newer state for.
- **Bounded retries.** `MAX_ENTITY_ETAG_RETRIES` in the helper — never until it lands, or one hot row spins a request a user is waiting on.
- **Exhaustion is a real outcome, and the call decides which.** Fire-and-forget telemetry drops it (a view-count increment keeping its own loop); anything a user is waiting on gets the helper's `CONFLICT` so they can retry, rather than returning success over a change that never landed.
- **Only a lost race retries.** Re-read after a failed write: a version that moved is the concurrent writer, an unchanged version means the write failed for something a retry cannot fix, so that error propagates as itself. Without that split a transient fault degrades into `CONFLICT` after N attempts and names the wrong cause.

Anything derived from the version that won has to be read out of the attempt that wrote it, not the one the procedure started with — a file delete captures the removed file's `filename` inside `getUpdateEntity`, so the blobs it publishes for deletion belong to the file it actually removed.

## What the mock does and does not reproduce

`MockTableClient` honours the condition (`#applyUpdate` throws a `412` `MockRestError` when the passed etag doesn't match the stored one, `"*"` being the wildcard) and re-etags on every write, so the whole loop is testable. What it does **not** reproduce is the interleaving: every mock client resolves in the same microtask drain, so two concurrent procedures run to completion one after the other and a bare `Promise.all` over them passes against the unconditional bug. Force the overlap by holding the first write open (`references/testing.md`) — never conclude from a green `Promise.all` that concurrency is covered.

## Why the write is conditional

**A server-side read-modify-write over an entity reads through `getEntityWithEtag` and writes conditionally.** An entity is one blob, so an unconditional write-back carries the whole version the caller read and silently erases whatever landed in between — the hazard, and why it surfaces to nobody, is `apps/web/content/docs/architecture/conditional-writes.md`. This applies to any procedure whose write depends on what it just read.

`getEntity` is the wrong reader here — it exists to **drop** the etag for callers that don't need it. `getEntityWithEtag` returns `{ entity, etag }`, and `updateEntity` forwards its extra arguments to the SDK, so the conditional write is `updateEntity(client, entity, "Merge", { etag })`. Where a shared procedure performs the read (as `getMessageProcedure` does), the etag belongs on the procedure context beside the entity — the round trip is already paid, and every procedure built on it then gets the option.

A rejected conditional write is a `412`, meaning only that the version is stale — the caller's intent is still valid, so re-read and re-apply rather than surfacing it. **`updateEntityConditionally` owns that loop — do not hand-roll it** (above).

**Classify a rejection with the `checkIs*` helpers in `@esposter/db`, and take `RestError` from `@azure/core-rest-pipeline`** — never from `@azure/storage-blob` or `@azure/data-tables`, which both re-export that one class (`no-restricted-syntax`). The helpers classify errors from both SDKs, so an `instanceof` against a re-export depends on the two resolving one shared copy, and the day a version bump splits them the check silently stops recognising the other SDK's errors.
