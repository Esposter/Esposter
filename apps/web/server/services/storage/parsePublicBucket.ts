import { StorageBucket } from "@esposter/db-schema";
import { z } from "zod";

// The buckets the Worker serves at their stable urls: the app's own and the users'. A game's objects are read from its
// Hosted origin and the shared hosted bucket from its custom domain, so no other public bucket is served here
const servedPublicBucketSchema = z.enum([StorageBucket.PublicAppAssets, StorageBucket.PublicUserAssets]);

export const parsePublicBucket = (bucketName: string) => {
  const { data, success } = servedPublicBucketSchema.safeParse(bucketName);
  return success ? data : undefined;
};
