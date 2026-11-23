import { StorageBucket } from "@esposter/db-schema";
import { z } from "zod";

// The buckets the Worker serves at their stable urls: the app's own, the users', and Genshin's until its readers move to the
// Hosted origin (the hosted-assets change, task 6.5, removes it then). The shared hosted bucket is read from its custom
// Domain, so it is not served here
const servedPublicBucketSchema = z.enum([
  StorageBucket.PublicAppAssets,
  StorageBucket.PublicGenshinAssets,
  StorageBucket.PublicUserAssets,
]);

export const parsePublicBucket = (bucketName: string) => {
  const { data, success } = servedPublicBucketSchema.safeParse(bucketName);
  return success ? data : undefined;
};
