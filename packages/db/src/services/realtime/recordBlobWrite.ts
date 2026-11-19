import type { RecordedBlobs } from "#src/models/realtime/RecordedBlobs";

import { getBlobWriteTopics } from "#src/services/realtime/getBlobWriteTopics";

// The one place a blob write is recorded: a put, a delete, a multipart completion and the confirm of a presigned upload each name
// The key they changed, and that key's topics publish once the scope settles, as a put's do
export const recordBlobWrite = (blobs: RecordedBlobs | undefined, bucket: string, key: string): void => {
  blobs?.writes.push(...getBlobWriteTopics(bucket, key));
};
