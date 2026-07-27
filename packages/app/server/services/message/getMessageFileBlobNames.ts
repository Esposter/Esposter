import type { FileEntity, RoomInMessage } from "@esposter/db-schema";

import { getBlobName, getThumbnailBlobName } from "@esposter/db";
// Every blob one message attachment owns: the upload itself and its thumbnail. Only images carry a thumbnail, but the
// Deletion handler deletes if the blob exists, so naming it unconditionally costs a no-op for every other file type and
// Needs no mime check at the call site.
//
// One helper rather than the pair rebuilt per delete path: `deleteFile`, `deleteMessage` and `deleteUploadFiles` all
// Sweep this same set, and a derivative added to one and missed by another leaks that blob forever — the class of miss
// [blob lifecycle](/docs/architecture/blob-lifecycle) exists to prevent.
export const getMessageFileBlobNames = (
  roomId: RoomInMessage["id"],
  { filename, id }: Pick<FileEntity, "filename" | "id">,
) => [getBlobName(`${roomId}/${id}`, filename), getThumbnailBlobName(roomId, id)];
