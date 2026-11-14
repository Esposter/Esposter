import type { StorageBucket } from "#src/models/storage/StorageBucket";

// Storage's own BlobCreated/BlobDeleted subject shape. Both ends of every storage-event round trip read it from
// Here: a subscription filters on the prefix and its handler strips the same prefix back off to recover the blob
// Name, so a filter that would deliver events the handler cannot parse is not expressible.
export const getBlobSubjectPrefix = (containerName: StorageBucket) =>
  `/blobServices/default/containers/${containerName}/blobs/`;
