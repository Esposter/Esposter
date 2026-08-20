---
title: Room attachment quota
description: A storage allowance for a room's attachments, charged to the room rather than to whoever happened to upload.
---

# Room attachment quota

Message attachments are the one upload path with no **storage** bound. The [per-user storage quota](/docs/platform/storage-quotas) counts resource files only, so nothing caps the total a room accumulates. What still applies per file is the room's `maxFileSizeBytes` check at SAS issuance — a declared-size gate, which an under-declaring client can exceed the same way it can anywhere else ([file uploads](/docs/architecture/file-uploads)).

**Why deferred.** Charging room attachments to the uploader's personal allowance is the wrong model: it makes one person's quota depend on how much they contribute to shared rooms, and it puts a number about chat in the resource explorer. The honest model is a **room-scoped** allowance — a room has a size, an owner sees it, and a room that fills up stops accepting attachments — but that needs an owner-facing surface (where the bar lives, who is warned, what happens at the limit) and a decision about who pays for a room nobody owns any more. None of that is worth building before rooms are large enough for the number to matter.

**What it would reuse.** Almost all of it: the ledger (`storage_blobs` already keys on container plus blob name), the reserve-at-SAS-issuance gate, and the `BlobCreated` reconcile handler — the subscription would take the message-assets prefix back, and the counter would move from the user row to the room row.

**Revisit when:** a single room's attachments pass a gigabyte, or the storage bill's message-assets share becomes visible next to resource assets — whichever comes first.
