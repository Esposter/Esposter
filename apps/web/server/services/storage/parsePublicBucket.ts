import { storageBucketSchema } from "@esposter/db-schema";

// A bucket is public by its name alone: every `public-` bucket is served at its stable url, and no other is served there
export const parsePublicBucket = (bucketName: string) => {
  const { data, success } = storageBucketSchema.safeParse(bucketName);
  return success && data.startsWith("public-") ? data : undefined;
};
