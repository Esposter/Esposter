import { getBlobName } from "@/services/azure/container/getBlobName";
import { getThumbnailBlobName } from "@/services/azure/container/getThumbnailBlobName";
// Every blob one uploaded file owns, named in the one place both ends of its life can read. The upload mints a write
// SAS per name here and every delete path sweeps this same set (`Object.values` — the whole record is the set), so a
// Derivative added at one end and missed at the other is either an upload nothing can reach or a blob nothing ever
// Reclaims ([blob lifecycle](/docs/architecture/blob-lifecycle)).
//
// Only images carry a thumbnail, but a delete removes if the blob exists, so naming it unconditionally costs a no-op
// For every other file type and keeps the mime check at the single site that mints the write SAS.
export const getFileBlobNames = (prefix: string, id: string, filename: string) => ({
  blobName: getBlobName(`${prefix}/${id}`, filename),
  thumbnailBlobName: getThumbnailBlobName(prefix, id),
});
