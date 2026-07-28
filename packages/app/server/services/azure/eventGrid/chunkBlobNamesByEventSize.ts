import { MAX_BLOB_DELETION_EVENT_BLOB_NAMES, MAX_BLOB_DELETION_EVENT_DATA_BYTES } from "@esposter/db-schema";

// Splits blob names into the largest chunks a single deletion event may carry. Bounded by two things at once,
// Because either alone lets an event through that Event Grid rejects: the name count the handler's schema
// Accepts, and the UTF-8 size the 1 MB event cap allows. A name is arbitrary user text, so counting names says
// Nothing about bytes — a chunk of maximal CJK filenames is several times the size of the same count in ASCII.
// A single name that exceeds the byte budget on its own still gets its own chunk: dropping it would silently
// Strand that blob, and the publish failing loudly for one oversized name is the better of the two.
export const chunkBlobNamesByEventSize = (blobNames: string[]): string[][] => {
  const chunks: string[][] = [];
  let currentChunk: string[] = [];
  let currentBytes = 0;
  for (const blobName of blobNames) {
    // The serialised cost of one array element: the name's own bytes, its two quotes and the separating comma.
    const blobNameBytes = Buffer.byteLength(blobName, "utf8") + 3;
    if (
      currentChunk.length > 0 &&
      (currentChunk.length === MAX_BLOB_DELETION_EVENT_BLOB_NAMES ||
        currentBytes + blobNameBytes > MAX_BLOB_DELETION_EVENT_DATA_BYTES)
    ) {
      chunks.push(currentChunk);
      currentChunk = [];
      currentBytes = 0;
    }

    currentChunk.push(blobName);
    currentBytes += blobNameBytes;
  }

  if (currentChunk.length > 0) chunks.push(currentChunk);
  return chunks;
};
