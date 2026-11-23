import type { BlobTopic } from "@esposter/db-schema";

// The blobs a request, or a unit of work, reads and writes, as the topics they name: a read's topics are watched with
// Its Answer, and a write's are published once it settles
export interface RecordedBlobs {
  reads: BlobTopic[];
  writes: BlobTopic[];
}
