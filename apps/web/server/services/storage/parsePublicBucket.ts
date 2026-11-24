import { StorageBucket } from "@esposter/db-schema";
import { z } from "zod";

// The buckets the Worker serves at their stable urls: the app's own and the users'. The shared hosted bucket is read
// From its custom domain, so it is not served here
const servedPublicBucketSchema = z.enum([StorageBucket.PublicAppAssets, StorageBucket.PublicUserAssets]);

export const parsePublicBucket = (bucketName: string) => {
  const { data, success } = servedPublicBucketSchema.safeParse(bucketName);
  return success ? data : undefined;
};
