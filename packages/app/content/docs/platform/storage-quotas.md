---
title: Storage quotas
description: Per-user blob-storage quotas (Free = 10 GiB) held atomically at SAS issuance and charged by Storage's own BlobCreated event, with a usage meter in the resource explorer's header.
---

# Storage quotas

Every user has a bounded, tier-derived allowance for the files they keep in their own resources — Free = 10 GiB — that they genuinely cannot exceed by hammering uploads, shown back to them as a "X of Y used" meter in the [Resource Explorer](/docs/platform/resource-explorer)'s header. The bar and the limit shipped together: a usage number nobody can act on was the reason the display was deferred on its own.

Nothing is scheduled. The counter moves only when Azure tells us a blob landed or one of our own deletions removes it, and an abandoned upload needs no cleanup at all because its hold expires as a **predicate** rather than as a state some job flips.

## Why a plain pre-flight check is not enough

The obvious design — "read `storageBytesUsed`, if under quota issue the SAS" — does not stop abuse, for two structural reasons:

1. **It races.** Read-then-check is not atomic. A client firing many upload requests concurrently has them all read the same low counter, all pass, and all upload — overshooting by an unbounded amount.
2. **The SAS carries no byte cap.** Uploads are a two-step flow ([file uploads](/docs/architecture/file-uploads)): the server mints a scoped write SAS, the client PUTs bytes **directly to Azure Blob**. The server is never in the data path, so it cannot stop a client that declares 1 MB and PUTs 1 GB, and it cannot abort a transfer mid-stream.

This is the difference from Gmail and Drive: their uploads flow **through Google's servers**, so the server counts bytes as they stream and hard-aborts the instant you cross the line. We structurally cannot abort a direct-to-blob upload — so the check is made **part of the write**, and what the client declared is never what it is ultimately charged.

## How it works

```mermaid
flowchart TD
  client[Client upload] -->|"generateUploadFileSasEntities (declared size)"| sign[Sign write SAS locally]
  sign --> reserve{"Lock user row<br/>used + live holds + declared &lt;= quota?"}
  reserve -->|no| reject["FORBIDDEN — You have run out of storage"]
  reserve -->|yes| ledger[("storage_blobs hold<br/>countedBytes = 0<br/>expiresAt = SAS ttl")]
  ledger --> respond[SAS returned to client]
  respond --> put[Client PUTs bytes to Azure Blob]
  put --> created["Storage emits BlobCreated<br/>with contentLength"]
  created --> reconcile["ReconcileStorageBlob<br/>counter += actual - countedBytes"]
  reconcile --> counter[("users.storageBytesUsed")]
  del["Blob deletion / purge"] -->|"counter -= countedBytes, row dropped"| counter
  ledger -.->|"expiresAt passes with no BlobCreated —<br/>the hold simply stops counting"| gone(["Nothing runs"])
  counter -->|storage.getUsage| ui["Usage bar — 3.2 GB of 10 GB"]
  tier[("users.storageTier")] -->|StorageTierQuotaMap| quota[Quota bytes]
  quota --> reserve
  quota --> ui
```

**The counter holds stored bytes and nothing else.** `users.storageBytesUsed` is the sum of what is actually in blob storage for that user. A declaration the client has not yet made good on is not in it — that lives in the ledger and is summed at reserve time.

**Reserve.** The SAS is signed first — signing is local and touches nothing in Azure — and the reserve runs before the response is returned, so a rejection is a write target the client never receives. The resource upload chokepoint goes through `generateReservedUploadFileSasEntities`, which mints and reserves in one call: a new upload path cannot hand out write targets nothing accounts for. In one transaction: this user's collectable holds are deleted (pure garbage collection — they never entered the counter); the user row is taken `FOR UPDATE`, which is what makes concurrent reserves serialize instead of race; the live holds are summed; and `storageBytesUsed + pending + declared <= quota` decides. Then one `storage_blobs` row per write target, with `countedBytes = 0`.

**Lock order: `storage_blobs` before `users`, on every path that touches both.** A release deletes the ledger rows and then decrements their owners; a reconcile locks the ledger row and then moves the counter; so the reserve collects expired holds _before_ it takes the user row rather than after, even though it is the one path that could hold the user lock the whole way. Taking the user row first would close a cycle with a concurrent release or reconcile of that user's rows, and Postgres resolves that by aborting one side — a 500 on an upload the user could retry, or a dead-lettered `BlobCreated` whose bytes are never charged. Nothing decides anything before the user lock: the collection moves no bytes, and the sum and the gate that read it both sit behind it. Within a release, the owners are locked in sorted order for the same reason.

**Charge.** Storage's own `Microsoft.Storage.BlobCreated` event carries the stored object's `contentLength`, and arrives seconds after the PUT. The handler moves the counter by `actual − countedBytes` and sets `countedBytes = actual`. That one expression is correct in all three cases at once: the first event adds the whole object, a redelivery computes a **zero** delta instead of double-counting, and a second upload to the same still-valid write target corrects the counter rather than stranding the old size on it.

**Release.** Deleting a blob drops its ledger row and decrements its owner by whatever that row was holding — zero if the blob never landed. The row is what carries both the amount and the owner, which makes a redelivered deletion event a no-op and is also the **only** way a blob can be attributed to an owner at all: a blob name carries the resource, not the uploader.

The delete and the release are one operation (`deleteStorageBlobs`), waved in chunks of `MAX_CONCURRENT_BLOB_DELETIONS`, and **each wave releases exactly the names it removed — not the set it was handed**. That is what makes a partial failure safe: a prefix deletion re-resolves its set from what is still in the container, so a blob an earlier attempt removed is one the redelivery can never name again, and a release keyed on the retry's smaller listing would hold those bytes against their owners forever. Waving also bounds the release statement, whose `IN (…)` would otherwise expand past what a single Postgres bind message may carry on a directory of tens of thousands of blobs. The failure is rethrown after the wave's release lands, never before it.

**Expiry.** Past `expiresAt` — the SAS's own TTL — the write target is dead, so the hold cannot become real: the sum and the in-flight count both read `expiresAt > now`, so it stops counting the moment the predicate turns false. No release, no job, no compensating write.

**Collection is a different, later bound, and the difference is load-bearing.** A hold that stopped counting is not a hold that may be deleted: a `BlobCreated` for a blob that _did_ land can still be inside Event Grid's retry window, and a reconcile that finds no ledger row charges nothing and reports nothing — the bytes would be stored, attributed to nobody, with no dead letter to show for it. So a row is kept until no event naming it can still arrive. Storage checks a SAS against the moment it _receives_ a request, not the moment that request finishes, so the last PUT a write SAS authorizes **starts** at `expiresAt` and raises its event whenever the upload completes; Event Grid then retries that event for `EVENT_GRID_DELIVERY_TTL_MS`. The reserve therefore collects only rows whose `expiresAt` is older than the delivery window plus an upload-completion allowance — and the allowance is `WRITE_SAS_DURATION_MS`, the SAS's own lifetime reused, which is a bound already in hand and orders of magnitude beyond what a `MAX_FILE_REQUEST_SIZE` upload can take. The bound is derived from the subscription's own `retryPolicy` rather than restated beside it, because two hard-coded hours that drift apart fail silently in exactly this direction. The rows are dropped opportunistically by the next reserve that user makes, which already holds their rows under lock.

The quota itself is **resolved from the tier at read time**, never copied onto the user row, so moving a user to a new tier changes their limit instantly with nothing to backfill. Only the _usage_ is stored, because recomputing it means enumerating every `{resourceId}/` directory and message-attachment blob — exactly what got the display deferred in the first place.

## Why there is no scheduled sweep

The first cut of this feature settled holds with a timer that woke every 15 minutes, listed expired rows, and probed each blob to decide whether to charge or release it. That was replaced, and the reasoning generalises:

- **The event already exists.** Storage emits `BlobCreated` with the exact byte count on a system topic that is already provisioned (the dead-letter replay subscribes to the same event type). Polling for a fact the platform will push is standing compute spent to learn something late.
- **The other half was never an event.** "This hold expired" is not something that happens — it is something that becomes true. Written as a `WHERE` clause it needs nothing to run; written as a job it needs a schedule, a batch cap, a retry policy, and an ordering story against the arrival of `BlobCreated`.
- **The race disappears rather than being handled.** With two signals (a persistence-time confirm and an unordered, at-least-once reconcile) a whole state machine of conditional transitions exists purely to survive them arriving out of order. With one signal and a predicate there is no second thing to be out of order with.

The cost of the swap is one Event Grid subscription per environment on a system topic that already exists — no new Azure resource, one event per upload, and reconciliation latency in seconds rather than up to an hour. What it removes is a timer function, a batch cap, and two blob requests per expired row.

A lost `BlobCreated` would leave a blob stored but uncharged. The subscription dead-letters like the others, but **its dead letters are quarantined rather than replayed, and that is deliberate**: this is the only handler fed by a _system_ topic, so the payload carries storage's own `Microsoft.Storage.BlobCreated` event type rather than an `AzureFunction`, and the [replay gate](/docs/infra/eventgrid-dead-letter) admits only event types it can route. Nothing could consume a republish of one either — the replay publishes to the custom topic, where no subscription matches that type, and a system topic cannot be published to at all. The consequence, stated rather than mitigated: those bytes stay uncharged until a usage recompute, the same one the uncounted blobs below need. What the dead letter buys is the record — the quarantine copy keeps Event Grid's diagnostics and the quarantine is logged, so the loss is inspectable instead of silent. The operator remediation for a normal quarantine (moving the blob back to the container root) is a no-op here, because the event type is still not an `AzureFunction` on the next pass.

## The residual gap, and why it is acceptable

Between the PUT and the `BlobCreated` event, a client that under-declared is holding less space than it is about to use. The size of that gap is **not** bounded: Azure blob SAS has no upload-length option, and the PUT never passes back through Nitro, so `MAX_FILE_REQUEST_SIZE` constrains the declaration the client sends us and nothing about the bytes it sends Azure.

What is bounded is the gap's **shape**. `MAX_UNRECONCILED_STORAGE_BLOBS` caps how many under-declared uploads one user can have in flight at once, and `BlobCreated` charges each one's real size within seconds of its PUT completing — after which the counter is truthful and every further reserve is rejected. So abuse is a single burst, not a sustained drain, and it only ever exhausts **their own** allowance — never another user's.

The cap counts **live holds**, which is one per write target and so one per upload — the resource upload chokepoint mints no thumbnail targets, so there is nothing riding alongside a file to distort it. The same number bounds each upload request's `files` array, because a batch larger than the cap can never pass the reserve however long the client waits.

True Gmail-style hard enforcement would require **proxying uploads through our own server** so it can count bytes and abort mid-stream. That is rejected: it puts our compute in the data path for every upload — cost, latency, and re-architecting the entire SAS flow — to close a self-inflicted gap that only harms its own author.

## Data model

- `StorageTier` — pg enum, `Free` only for now. The enum exists so a paid tier is a value add rather than a schema change.
- `StorageTierQuotaMap` — `{ [StorageTier.Free]: 10 * GIBIBYTE }`, `as const satisfies Record<StorageTier, number>`.
- `users.storageTier` + `users.storageBytesUsed` — the tier and the stored-bytes total. `bigint` in `number` mode: 10 GiB is ~1e10, far under the 2^53 safe-integer ceiling.
- `storage_blobs` — the ledger, keyed `(containerName, blobName)`. `declaredBytes` is the hold, `countedBytes` is what the counter is carrying for this blob right now (zero until the first `BlobCreated`), `expiresAt` is the SAS TTL, `reconciledAt` records that it landed at least once. One index, `(userId, reconciledAt)`: every query against the ledger leads with the user, and nothing scans it account-wide.

Existing users start at `storageBytesUsed = 0`, so for them the gate is **advisory until their real usage accumulates** — a user already over 10 GiB keeps uploading until enough of their blobs are ledgered. Under-counting only ever _under_-rejects, so the advisory window never wrongly rejects a legitimate upload. New users are accurate from their first upload.

## What is not counted

Three kinds of blob exist outside the ledger and are deliberately uncounted:

- **Publish and duplicate clones** (`cloneContentAssets`) — copies written server-side, never through a reserve. Their `BlobCreated` arrives and finds no ledger row, which is a no-op by design.
- **Blobs uploaded before this shipped** — nothing backfills them ([persisted data — latest shape only](/docs/architecture/persisted-data-latest-shape-only)).
- **Room attachments** — the quota counts what a user keeps in their own resources, and a room's files belong to the room. Charging them to whoever uploaded made one person's allowance depend on how much they contribute to shared rooms, and put a number about chat in the resource explorer. The room-scoped replacement is written up as [room attachment quota](/docs/esbabbler/deferred/room-attachment-quota); until it lands, message uploads are bounded by nothing here.
- **Everything outside the resource upload chokepoint** — avatars and room images go through their own SAS paths, and the subscription filter does not even deliver their events.

Closing these needs a recompute that lists real object sizes per user. Worth doing once the counter has drifted enough to matter, and it is a one-shot backfill rather than a recurring sweep.

## Failure and retry semantics

- **Client under-declares:** the counter is low for the seconds until `BlobCreated` lands; the next reserve then rejects. Bounded as above.
- **SAS issued, upload abandoned:** the hold stops counting at `expiresAt` and is dropped by the next reserve that user makes past the collection bound above. If bytes did land, `BlobCreated` charges them and the blob is an orphan under `{id}/files` that **nothing reclaims** until `purgeResource` takes the whole directory ([blob lifecycle](/docs/architecture/blob-lifecycle)) — that prefix has no unreferenced-asset sweep, by design, because a restore must be able to hand back a whole resource.
- **`BlobCreated` redelivered:** the delta is zero.
- **`BlobCreated` dead-lettered:** quarantined for an operator, not replayed — see above. The blob stays uncharged.
- **`BlobCreated` for a blob nothing reserved** (a clone, a name that will not percent-decode): a no-op, never an error. The handler tries the raw name, then the decoded one, and a name that cannot be decoded keeps its raw form rather than throwing — a throw would make an unaccounted blob a poison event that retries to the dead letter.
- **A release is missed:** the counter stays high, which only _under_-serves that user (rejects slightly early) — the safe direction. Only a whole wave can be missed, never part of one.

## Key files

| File                                                                                                 | Role                                              |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `packages/db-schema/src/models/user/StorageTier.ts`                                                  | tier enum                                         |
| `packages/db-schema/src/schema/users.ts`                                                             | `storageTier` + `storageBytesUsed`                |
| `packages/db-schema/src/schema/storageBlobs.ts`                                                      | the ledger                                        |
| `packages/db-schema/src/services/azure/container/getBlobSubjectPrefix.ts`                            | storage's event subject shape, read by both ends  |
| `packages/db-schema/src/services/azure/container/parseBlobSubject.ts`                                | subject → (container, blob name)                  |
| `packages/app/shared/services/storage/StorageTierQuotaMap.ts`                                        | tier → quota bytes                                |
| `packages/app/server/services/storage/generateReservedUploadFileSasEntities.ts`                      | the upload chokepoint — mint and reserve as one   |
| `packages/app/server/services/storage/reserveStorageBytes.ts`                                        | GC expired holds, lock, gate, write holds         |
| `packages/app/server/services/storage/getStorageBlobReservations.ts`                                 | SAS batch → the holds it needs                    |
| `packages/db/src/services/storage/reconcileStorageBlob.ts`                                           | declared hold → charged bytes                     |
| `packages/db/src/services/storage/deleteStorageBlobs.ts`                                             | delete a set of blobs and release what it removed |
| `packages/db/src/services/storage/releaseStorageBlobsWhere.ts`                                       | the one place bytes leave the counter             |
| `packages/azure-functions/src/handlers/reconcileStorageBlobHandler.ts`                               | the `BlobCreated` handler                         |
| `packages/infra/src/azure/resources/Microsoft.EventGrid/eventSubscriptions/prodEvgsEsposterAe007.ts` | the subscription, filtered to resource assets     |
| `packages/app/server/trpc/routers/storage.ts`                                                        | `getUsage`                                        |
| `packages/app/app/components/Resource/StorageMeter.vue`                                              | the usage meter in the explorer shell             |
| `packages/app/app/store/storage.ts`                                                                  | the usage the meter renders, read once            |
| `packages/app/app/layouts/resource.vue`                                                              | the shell that mounts it on every resource page   |

## Notes

- The meter lives in the [resource shell](/docs/platform/resource-explorer)'s header, not in the app bar and not on user settings. Storage is what this area spends, so the number sits where uploads happen and on no route that cannot spend it; the app bar would make every page pay for a query about resources. It reads as a bar plus "X of Y used" at every viewport — the label is already short enough that hiding it on a narrow screen only made the bar look broken. The tier lives in the tooltip, which opens on click as well as hover, because a touch device has no hover to reveal it with. Being in the shell puts it on **every** resource page, not only Home.
- The number itself lives in `useStorageStore`, read once per session rather than once per mount. Each resource page declares the shell layout in its own template, so the meter is genuinely remounted on every navigation inside the explorer — a component-local read would blank the bar and issue a round trip per page change. There is no invalidation to pair with it: the counter only moves when storage's own `BlobCreated` lands seconds after a PUT, so a refresh fired the moment an upload finishes would read the same number it already has.
- The resource upload input gained a `size` per file, matching the message path. It is bounded at the Zod boundary (`z.int().positive().max(MAX_FILE_REQUEST_SIZE)`) because a negative or non-finite declaration would shrink the pending sum and weaken the gate.
- `purgeResource` releases its directory **by prefix**. The purge never enumerates blob names, and the `resources` row it deletes has no foreign key into the ledger, so without this the rows would be dropped by no one and their bytes held forever.
- The subscription filters with a single `subjectBeginsWith` — `getBlobSubjectPrefix(AzureContainer.ResourceAssets)`, the one container whose uploads pass through a reserve. The handler agrees with that filter rather than trusting it (`STORAGE_BLOB_CONTAINERS`), so a filter that drifts wider delivers events the handler drops.
- A blob name reaches the handler through a url path and storage's encoding of it depends on the characters in it. Rather than guess, the raw name is looked up first and the decoded form only if that found no row — through `getDecodedUriComponent`, since a filename holding a lone `%` is legal and would otherwise throw.
- The reserve is a service called from the upload chokepoint, not a tRPC middleware. A middleware runs before the handler, and the ledger rows are keyed by blob names the handler is what mints — so a middleware would have had to either pre-mint the names or split the atomic transaction in two.
