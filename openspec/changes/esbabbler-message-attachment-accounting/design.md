# Message attachment accounting

Message uploads are reserved against the uploader's storage allowance when their write targets are minted, measured by the `BlobCreated` reconcile, and given back by the release path that already serves resource assets.

## Scope

Today a message upload's write target comes from `generateUploadFileSasEntities`, which mints a SAS per file and a sibling thumbnail target, with no reserve and no ledger row. The reconcile handler's container list holds resource assets only. The change adds the reserve, the measurement and the forward charge. It does not add a measured check against the room's size cap, and it does not change the declared-size gate.

## Decisions

- **The uploader pays, not the room.** The ledger's `userId` is the uploader, so the allowance is the uploader's. The alternative, a room-scoped allowance, is the [deferred room attachment quota](../../deferred/esbabbler/room-attachment-quota/design.md). It needs an owner-facing bar and a rule for an unowned room, and neither is built. Charging the room would need a new counter on the room row and a new meter; charging the uploader reuses the counter, the ledger and the meter that exist.
- **The procedure reserves before it mints.** `reserveStorageBytes` runs before any SAS is signed, the way the resource upload's chokepoint runs ([resource asset upload](../../specs/resource/storage-quotas/design.md)). A refused reserve throws the quota error and returns no target, so the client never holds a write target the ledger does not record.
- **The procedure becomes a mutation.** Minting now writes a ledger row, and a query that writes is a retry hazard: a retried read would hold a second row for the same blob names. The one caller, `useUploadFiles`, moves to the mutation client.
- **Thumbnails reserve a server-fixed size.** A thumbnail's bytes are produced by the client's canvas, and the input carries no size for it. Reserving the client's size would add a declared number with no gain, since the reconcile replaces any declared figure with the stored one. A named bound, `MAX_THUMBNAIL_BYTES`, next to the thumbnail's content type holds the space until the event lands. Its value follows the longest edge and quality the composer encodes at, set when the constant is written.
- **A second subscription, not a wider filter.** An Event Grid subscription takes one `subjectBeginsWith`. Dropping the filter would deliver every blob event in the account to the handler, which drops most of them. A second subscription costs one event subscription per environment and is the cheaper choice.
- **Forwards are charged, not refused.** A forward copies bytes the server writes, and the storage quota already rules that such writes are charged without being refused ([storage quotas](../../specs/resource/storage-quotas/design.md)). The forwarder is charged for each copy before the copy is written, through the same HEAD-then-charge step `cloneContentAssets` uses. Both paths share one helper.
- **Release needs no code.** `deleteStorageBlobs` and `releaseStorageLedgerEntriesByPrefix` read each row's bytes off the row and its user off the row. A message blob's row exists once the reserve writes it, so a delete, a discarded upload and a room deletion give bytes back through the paths that run today.

## How it works

```mermaid
sequenceDiagram
  participant C as Composer
  participant P as generateUploadFileSasEntities
  participant L as Storage ledger
  participant S as Blob storage
  participant E as Event Grid
  participant H as reconcile handler
  C->>P: files with declared size and mime
  P->>L: reserve originals and thumbnails for the uploader
  alt allowance or in-flight cap refuses
    P-->>C: quota error, no write target
  else reserved
    P-->>C: SAS per original and per thumbnail
    C->>S: block PUT to each target
    S->>E: BlobCreated on message-assets prefix
    E->>H: stored size and sequencer
    H->>L: charge the uploader the stored size
  end
```

A forward runs its own leg: the router reads each source blob's length, charges the forwarder for the copy, and copies it into the destination room's prefix. A failed copy releases its charge, as `cloneContentAssets` does.

## Failure and retry

- **A refused reserve** writes nothing and mints nothing. The composer shows the refusal and the files stay unsent.
- **A lost completion event** leaves the stored bytes uncharged, as it does for resource assets. The hold expires with its SAS, so the counter never holds bytes for a blob nothing wrote.
- **A redelivered event** finds the row and computes a zero delta, so the counter does not move twice.
- **A failed forward copy** releases the charge taken for it and throws, so the forward fails with nothing counted.

## Key files

| File                                                                                             | Role                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/server/trpc/routers/message/index.ts`                                                  | `generateUploadFileSasEntities` reserves and mints; `forwardMessage` charges each copy; the comment that calls room attachments outside the quota is rewritten |
| `apps/web/server/services/resource/generateReservedResourceAssetSasEntities.ts`                  | the precedent: mint and reserve in one call, which the message path mirrors                                                                                    |
| `apps/web/server/services/storage/reserveStorageBytes.ts`                                        | the gate, reused unchanged                                                                                                                                     |
| `apps/web/app/composables/message/file/useUploadFiles.ts`                                        | the composer's caller, moved to the mutation client and showing the refusal                                                                                    |
| `packages/db/src/services/azure/container/generateUploadFileSasEntities.ts`                      | mints the original and thumbnail targets; the caller reserves them first                                                                                       |
| `packages/db/src/services/azure/container/cloneFiles.ts`                                         | copies a forwarded file's blobs; its copies are charged by the caller                                                                                          |
| `packages/db/src/services/storage/chargeStorageLedgerEntry.ts`                                   | the charge for a server-written blob, reused for each copy                                                                                                     |
| `packages/db/src/services/storage/deleteStorageBlobs.ts`                                         | releases a deleted blob's row, reused unchanged                                                                                                                |
| `apps/functions/src/handlers/reconcileStorageLedgerEntryHandler.ts`                              | the `BlobCreated` handler; its container list gains message assets                                                                                             |
| `apps/infra/src/azure/resources/Microsoft.EventGrid/eventSubscriptions/prodEvgsEsposterAe007.ts` | the resource-asset subscription; a second one covers the message prefix                                                                                        |
| `apps/infra/src/azure/resources/Microsoft.EventGrid/eventSubscriptions/devEvgsEsposterAe007.ts`  | the dev counterpart                                                                                                                                            |
| `packages/db-schema/src/services/file/constants.ts`                                              | gains the thumbnail's declared bound beside its content type                                                                                                   |
| `packages/db-schema/src/schema/storage/storageLedgerInStorage.ts`                                | the ledger comment that keys a message asset by room is rewritten                                                                                              |

A new file, in the tree form the design template asks for:

```text
apps/web/server/services/message/file/generateReservedMessageFileSasEntities.ts   mint and reserve a message's write targets in one call
```

## Notes

- Room emoji, avatars and call backgrounds write to `message-assets` or other containers without a reserve. This change does not charge them. Room emoji use the same mint, so charging them is a follow-up that reuses the new helper; the deferred room-attachment page lists the rest.
- The room's size cap stays a declared-size check. Measuring the stored size against the cap, and deleting a blob that exceeds it, would be a second decision and is not part of this change.
- The outstanding-reservation cap counts thumbnails as well as originals, so a drop of many images reaches the cap sooner than a drop of the same number of documents.
