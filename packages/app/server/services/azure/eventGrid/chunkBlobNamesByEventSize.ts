import { MAX_BLOB_DELETION_EVENT_BLOB_NAMES, MAX_BLOB_DELETION_EVENT_DATA_BYTES } from "@esposter/db-schema";
import { chunkBySerializedSize } from "@esposter/shared";

// Splits blob names into the largest chunks a single deletion event may carry — the name count the handler's
// Schema accepts, and the UTF-8 size the 1 MB event cap allows. Both bounds at once, because either alone lets an
// Event through that Event Grid rejects; the reasoning for measuring serialized bytes lives in the primitive
export const chunkBlobNamesByEventSize = (blobNames: string[]): string[][] =>
  chunkBySerializedSize(blobNames, MAX_BLOB_DELETION_EVENT_DATA_BYTES, MAX_BLOB_DELETION_EVENT_BLOB_NAMES);
