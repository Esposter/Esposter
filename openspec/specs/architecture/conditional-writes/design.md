# Conditional Writes

A procedure that reads an entity, computes something from it, and writes the result back is not one operation — it is two, with a gap in between that another caller can write into. A write that rewrites a whole entity carries the whole version the procedure read. Two of them running at once both compute from that same version, and the later write echoes back a body that never saw the earlier change.

Nothing surfaces. There is no error, no log, and the caller whose write landed first was already told it succeeded. The change is simply gone, and the only witness is a user who watches their edit revert.

So: **a write derived from what the procedure just read is conditional on the state it read.** This is [Persist Then Notify](../persist-then-notify/design.md)'s persist phase under concurrency — the guard/persist/notify ordering is unchanged, the persist step just carries the state it depends on.

## Which writes this covers

A write is a read-modify-write whenever the value it stores could not have been computed without first reading the entity:

| Write                              | Why it qualifies                                                                                                 |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| A map or array rewritten wholesale | `votePoll` stores the whole votes map; `deleteFile` stores the whole surviving `files` array                     |
| A full rewrite of a computed value | Clearing a field that the write must also unset (`deleteLinkPreview`, `unpinMessage`) has to write the full body |
| A counter or accumulator           | The new value is the old value plus one                                                                          |

A write of fields taken straight from the caller's input is **not** one — `updateMessage` writing the text the user typed, or `pinMessage` setting `isPinned: true`, depends on nothing it read.

The full-rewrite row is the one that gets missed, and it is the worst of the three: the write carries every property, so replaying it from a stale read reverts _all_ concurrent changes to that entity, not just the field the procedure meant to touch.

## The D1 guarded write

D1 has no interactive transaction: nothing holds a row open across an `await`. So the read and the write it decides cannot be split by a round trip and be safe. The precondition goes into the `WHERE` of the `UPDATE` instead, and the database evaluates it atomically with the write. A multi-statement write is one `db.batch`, which applies all of its statements or none.

A guard is lost when the guarded `UPDATE` changes no row: it returns no row, which is a batch whose `meta.changes` is `0`. That is not an error. The database did what it was asked, and the answer is that the row no longer holds the state the write was computed from.

```mermaid
flowchart TD
  R["read the row and the state the write depends on"] --> D["compute the write from that state"]
  D --> W["batch: UPDATE ... WHERE names the state read"]
  W -->|"a row returned, meta.changes is 1"| N["Notify<br/>emit the delta, never the replaced body"]
  W -->|"no row returned, the guard lost"| RR["Re-read the row"]
  RR -->|"gone"| NF["NOT_FOUND<br/>the row was deleted under the write"]
  RR -->|"the read itself failed"| RF["Log it, then CONFLICT<br/>the attempt could not be classified"]
  RR -->|"state moved"| B{"Does the caller retry?"}
  B -->|"no: a claim"| C["Refuse<br/>the claim was taken by another writer"]
  B -->|"yes, attempts left"| D
  B -->|"yes, no attempts left"| CF["CONFLICT<br/>the caller sends it again"]
```

A lost guard is decided by a re-read, and the re-read is what tells the cases apart. A row that is gone is `NOT_FOUND`. A failed read is logged with its cause and answered `CONFLICT`, since the attempt could not be classified. A row whose state moved is a lost race, and the caller either refuses it, when the write is a claim another writer can win, or re-applies its intent to the state it re-read, a bounded number of times.

The loop back to applying the intent is the whole design: **the retry re-applies the intent, it does not replay the body.** "Record this vote", "drop this file", "clear this field" are all still valid after losing a race — only the body computed against the state that moved is stale. Writing that body again is the bug the guard exists to prevent.

No helper owns this loop. A caller writes its own guarded statement and reads whether it changed a row, because the decision about a lost guard is the caller's: a claim refuses, a vote retries, a save reloads. A shared helper is worth its place only once a second caller needs the same classification.

## Rules that fall out of it

The lifecycle above is a pattern rather than a helper, and the rules it holds every caller to are these: the guard is a predicate in the `WHERE` over the state read; the intent is re-applied to the state re-read rather than to the body first computed; the retry is bounded; exhaustion is an outcome the call chooses; only a lost race retries; the delta is the payload; and follow-up work is derived from the attempt that won. A caller reads the state in the same statement as the entity wherever a shared procedure already reads it.

One rule is the page's own because it is about what a status code cannot say: **an absent entity and a failed read are different facts.** A read returns nothing only when no row or object exists, and every other fault propagates — collapsing them is how a throttled re-read gets reported to a voter as `NOT_FOUND` for the message they are looking straight at, where `CONFLICT`, logged with its real cause, tells them to send it again.

## The same hazard, without a version on the row

The hazard the guard answers is general: **a write derived from a view that another writer can invalidate before it lands.** There are three ways to be safe from it, and they are not the same mechanism.

**Serialize**, so no stale view can exist. A read and the write it decides are one synchronous transaction inside a room's object, with no await between them, so nothing else can run in the gap: the second writer reads after the first has committed rather than beside it. Nothing is compared and nothing is rejected — the read and the write are simply not interleaved. D1 has no interactive transaction to hold a row open across a round trip, so a read that must not interleave with another writer's is never split from its write.

**Or carry a version token**, where waiting is impossible because the competing writer is not a transaction you can block — it is another process, or an event that has already been delivered. Then the write states which version it depends on and is rejected if that has moved.

**Or make the check the write**, where the condition is one the row can answer for itself. A `SELECT` that decides whether to write is a check-then-act: every concurrent caller reads the same pre-write row, so every one of them passes. Moving the predicate into the `UPDATE`'s own `WHERE` hands the decision to the database — the caller that gets a row back holds the claim and the one that gets none was beaten to it. This is what throttles an automatic [resource revision](../../resource/resource-snapshots/design.md) to one per interval, and it is the shape to reach for whenever a check reads "has enough time passed" or "is this still unclaimed": those are the row's questions, and asking them anywhere else is asking a copy.

| Where                                          | How it is made safe                                                      | What that stops                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| A D1 row read-modify-write                     | claim — one batch whose `UPDATE` names the state it read                 | two writers computing from one value concurrently                 |
| A room's messages, reactions and search        | serialized — read and write in one synchronous transaction in the object | a write landing between another write's read and its write        |
| An event handler writing what an event reports | token — the event's ordering value                                       | an older event delivered after a newer one                        |
| A throttle or a once-per-interval gate         | claim — the predicate in the `WHERE`                                     | two callers passing a check made from the same pre-write row      |
| A save blob (Clicker, Dungeons, Genshin)       | token — the object's `etag`, as the condition of a conditional put       | a save written over one another session changed since it was read |

The storage ledger's reconcile is the claim row at work: its batch's counter update applies only while the ledger row still holds the state the delta was computed from, so two events cannot both measure the same `countedBytes`.

The event-handler row is the one that gets missed, because a handler can pass every idempotency check and still be wrong. **Idempotent is not order-independent.** Idempotency asks "does running this twice differ from running it once" — a redelivery computing a zero delta answers yes and is genuinely safe. Ordering asks a question idempotency never poses: _does an older event arriving after a newer one leave the wrong state behind?_ Replaying the stale event is a well-behaved no-op by every idempotency measure and still overwrites the current value with a superseded one.

Queues deliver at least once and in no guaranteed order, and each job's dead-letter queue covers the deliveries it gives up on ([Cloudflare services](../cloudflare-services/design.md)). So a handler whose write depends on _when_ its event happened needs the event to say so:

- **R2's object-create notification carries `eventTime`, the only field in its body that says when the write happened.** R2 gives no per-object ordering token, so two writes to one key are ordered by it, at the millisecond it carries. The body is `R2ObjectCreatedQueueMessage` in `packages/db-schema/src/models/queue/`.
- **The token is stored beside the value it ordered, so the next event has something to compare against** — the ledger keeps it beside `countedBytes` ([storage quotas](../../resource/storage-quotas/design.md)).
- **A writer with no position passes no token and clears none, but it does not wait for one either.** The server's own provisional charge writes bytes without an ordering token. Clearing the stored one would leave the next stale event comparing against nothing and being applied, so the token it cannot rank against is the token it leaves alone. Making it _yield_ to that token is the tempting third rule and the wrong one: the blob it measures is rewritten under one name on every save, so an untokened writer that stood down after the first event never wrote again ([storage quotas](../../resource/storage-quotas/design.md) has what that cost). An unordered writer that cannot know it is not overwriting a newer measurement is instead made to be the one whose figure the next tokened write measures over.

A handler that writes nothing derived from its event's moment — one that deletes by name, or sets a flag — needs none of this. The question to answer per handler is whether two events for the same subject can carry _different_ values for what it writes; if they can, order decides which is right.

### Testing delivery order

The delivery order is an argument, so the test is the two calls in the wrong order — no mock of the notification required. Assert the newest value survives **and** that the stale event still reports having found its subject, or a caller that retries on a miss will retry forever on a correctly-dropped event.

## Testing it

Miniflare's D1 and R2 honour the condition, so a guarded statement is testable against them. A test that makes its two writes one after the other, each awaited before the next starts, never overlaps them: it has to hold the first write open with a promise the test resolves itself, so the second write runs against a state the first has not yet changed. A green `Promise.all` that never interleaved reports the hazard as covered.

## Key files

| File                                                              | Role                                                                                     |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `apps/web/server/services/storage/reserveStorageBytes.ts`         | the quota gate: one guarded batch that takes every reservation or none                   |
| `packages/db/src/services/storage/reconcileStorageLedgerEntry.ts` | the ledger's claim: the counter update applies only while the ledger row holds its state |
| `packages/db/src/services/storage/checkIsNewerSequencer.ts`       | the ordering check the storage ledger makes before it applies a blob event               |
| `apps/functions/src/durableObjects/RoomObject.ts`                 | a room's reads and writes, serialized in the object's synchronous transaction            |
| `apps/web/server/services/blobState/writeBlobState.ts`            | a save blob's write, conditional on the object's `etag` through R2's `onlyIf`            |
