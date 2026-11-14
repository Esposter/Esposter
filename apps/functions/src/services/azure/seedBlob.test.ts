import type { StorageBucket } from "@esposter/db-schema";

import { getBucket } from "#src/services/storage/getBucket";
import { describe } from "vitest";

export const seedBlob = async (containerName: StorageBucket, blobName: string): Promise<void> => {
  await getBucket(containerName).put(blobName, "");
};

describe.todo("seedBlob");
