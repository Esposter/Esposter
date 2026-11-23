import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";

// Every object a bucket holds, by its key, with the instant it was last written, so a caller tests whether a key is held
// And when it was stored
export const readBucketLastModifiedMap = async (bucketClient: R2BucketClient): Promise<Map<string, Date>> =>
  new Map((await bucketClient.list("")).map(({ key, lastModified }) => [key, lastModified] as const));
