import type { RecordedBlobs, RecordedDatabase } from "@esposter/db";

// A unit of work's recorded handle, and the blobs its bucket bindings record into while it runs
export interface RecordedUnit extends RecordedDatabase {
  blobs: RecordedBlobs;
}
