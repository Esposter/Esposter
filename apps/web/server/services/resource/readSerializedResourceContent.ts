import type { ResourceInResource } from "@esposter/db-schema";

import { getBucket } from "#server/services/storage/getBucket";
import { getContentBlobName, readJsonBlob } from "@esposter/db";
import { StorageBucket } from "@esposter/db-schema";

// The working copy as the JSON it was serialized to, undefined for a resource created and never saved
export const readSerializedResourceContent = async (id: ResourceInResource["id"]): Promise<string | undefined> => {
  const bucket = getBucket(StorageBucket.ResourceAssets);
  const serializedContent = await readJsonBlob(bucket, getContentBlobName(id));
  return serializedContent?.toString();
};
