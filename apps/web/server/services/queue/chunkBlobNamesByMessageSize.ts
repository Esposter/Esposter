import { MAX_BLOB_DELETION_MESSAGE_BLOB_NAMES, MAX_BLOB_DELETION_MESSAGE_BYTES } from "@esposter/db-schema";
import { chunkBySerializedSize } from "@esposter/shared";

// Splits blob names into the largest chunks a single deletion message may carry — the name count the handler's schema
// accepts, and the UTF-8 size the 128 KB queue cap allows. Both bounds at once, because either alone lets a message
// through that the queue refuses; the reasoning for measuring serialized bytes lives in the primitive
export const chunkBlobNamesByMessageSize = (blobNames: string[]): string[][] =>
  chunkBySerializedSize(blobNames, MAX_BLOB_DELETION_MESSAGE_BYTES, MAX_BLOB_DELETION_MESSAGE_BLOB_NAMES);
