import type { BlobTopic } from "@esposter/db-schema";

import { getBlobTopic } from "@esposter/db-schema";

// The topic a listing names: the directory its prefix lies in, which every write beneath the prefix publishes. A prefix
// That Does not end at a directory names the directory it starts in, a wider topic that never misses a write beneath
// The prefix
export const getBlobListTopic = (bucket: string, prefix: string): BlobTopic =>
  getBlobTopic(bucket, prefix.slice(0, prefix.lastIndexOf("/") + 1));
