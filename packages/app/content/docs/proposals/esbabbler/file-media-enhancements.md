---
title: File & media enhancements
description: Proposal — client-side image thumbnails, room attachment limits, and a files-in-room filter.
---

# File & Media Enhancements

Three upgrades to message attachments, all reusing the existing SAS upload flow ([/docs/architecture/file-uploads](/docs/architecture/file-uploads)).

## Scope

**Today:** files upload via SAS at full size; the message list renders images inline; there is no per-room constraint and no way to browse a room's files.

**This adds:**

1. **Client-side image thumbnails** — before upload, downscale images to a thumbnail (canvas, longest edge constant) uploaded alongside the original (`{roomId}/{fileId}.thumb`); the message list renders the thumbnail and opens the original in the lightbox. Cuts message-list bandwidth dramatically; no server compute (the [server-side transcoding](/docs/esbabbler/deferred/server-side-transcoding) deferral stands).
2. **Room attachment limits** — per-room max file size (≤ the global `MAX_FILE_REQUEST_SIZE`) and allowed MIME categories (images / video / audio / documents), stored as columns on `rooms`, enforced in `generateUploadFileSasEntities` (size baked into the SAS, categories checked server-side) and mirrored in the composer UI. Settings live in the room settings **Moderation** group, gate `ManageRoom`.
3. **"Files in this room" filter** — the search drawer gains a Files tab listing messages with attachments, newest-first. Backed by the messages Search index (attachment presence is indexable), same pattern as the Sent tab ([/docs/esbabbler/drafts-and-sent](/docs/esbabbler/drafts-and-sent)).

## Procedures

No new procedures for thumbnails (the existing SAS batch covers the extra blob). Attachment limits extend `updateRoom` input + `generateUploadFileSasEntities` validation. The files filter extends `searchMessages` with a `hasFiles` flag.

## Key files

| File                                                                        | Change                             |
| :-------------------------------------------------------------------------- | :--------------------------------- |
| `packages/app/app/services/azure/container/uploadBlocks.ts` (caller side)   | thumbnail generation before upload |
| `packages/db-schema/src/schema/roomsInMessage.ts`                           | limit columns (+ migration)        |
| `packages/db/src/services/azure/container/generateUploadFileSasEntities.ts` | enforce limits                     |
| `packages/app/server/services/message/searchMessages.ts`                    | `hasFiles` filter                  |

## Notes

Blob lifecycle already tiers old attachments (Cool@30d → Cold@90d); thumbnails follow the same policy for free by living in the same container.
