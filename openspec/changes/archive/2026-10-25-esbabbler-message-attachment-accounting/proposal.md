# Message attachment accounting

Gap 1 of the [gap survey](../gap-survey-2026-10-25/proposal.md).

## Why

A message upload reaches Azure through a write SAS, and nothing measures or charges it. The room's size cap is checked against the size the uploader declares, and no reader looks at the committed blob ([file media](../../specs/esbabbler/file-media/design.md) admits this). The storage allowance counts resource files only, and the `BlobCreated` reconcile is scoped to the resource-assets container. So the storage bill for `message-assets` has no bound: any client can keep writing for as long as a SAS lives, and every byte it writes is free.

The [room attachment quota](../../deferred/esbabbler/room-attachment-quota/design.md) idea is the room-scoped version of the same fix. It is deferred because its owner-facing surface is not worth building yet. This change does not build that surface.

## What Changes

- A message upload is reserved against the uploader's storage allowance when its write targets are minted, on the gate resource assets already pass through. A refused reserve returns no write target.
- The reconcile that measures a committed blob runs for message assets as well. A second event subscription covers the `message-assets` prefix, because a subscription filters on one prefix.
- A message's thumbnail is reserved as well, at a server-fixed declared size, and the reconcile replaces that size with the stored one.
- A forward copies each attachment into the destination room. The forwarder is charged for each copy before it is written.
- Deleting a message file, reverting an upload the composer discarded, and deleting a room already give bytes back through the release path, which reads each blob's ledger row by container. Those paths need no new release code.

## Recommendation

Charge the uploader. The gap says "the owner's storage allowance", and the owner here is the account that sent the file: the ledger already attributes a message asset to its uploader, so no new attribution is needed. This is an owner decision the brief left open, decided here. The room-scoped model stays deferred; this change sets an interim bound on the account, which is the bound the gap asks for.

The cost is the one the deferred page names: a user's allowance now moves with their chat uploads. The alternative, a bound per room with an owner surface, costs a surface and an answer to who pays for an unowned room. This change does not pay that cost yet.

## Capabilities

- **resource/storage-quotas** (modified): message attachments count against the uploader's allowance. Avatars, room images and game saves stay uncounted.

## Impact

- A user whose allowance is full cannot send a file. The composer shows the refusal that a full resource allowance already shows.
- Uploads and deletes in rooms move the uploader's meter. The meter is on resource pages, so the change is visible in the explorer.
- Each environment gains one event subscription.
- The declared-size gate stays. A client that under-declares still writes past the room's size cap until its SAS expires, but the stored size then reaches the counter and blocks its next reserve. The size cap remains a guardrail, not a boundary.
