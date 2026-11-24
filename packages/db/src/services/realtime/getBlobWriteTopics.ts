import type { BlobTopic } from "@esposter/db-schema";

import { getBlobTopic } from "@esposter/db-schema";

// The topics a write to a key publishes: the key itself, each directory above it (a prefix ending in `/`), and the
// Bucket's root, which every listing lies in. A listing names the directory its prefix lies in, so a write beneath it
// Matches exactly
export const getBlobWriteTopics = (bucket: string, key: string): BlobTopic[] => {
  const directories: string[] = [];
  for (let index = key.indexOf("/"); index !== -1; index = key.indexOf("/", index + 1))
    directories.unshift(key.slice(0, index + 1));
  return Array.from(new Set([key, ...directories, ""]), (name) => getBlobTopic(bucket, name));
};
