import type { StorageBucket } from "@esposter/db-schema";

import { getBucket } from "#src/services/storage/getBucket";
import { describe } from "vitest";

export const seedBlob = async (storageBucket: StorageBucket, blobName: string): Promise<void> => {
  await getBucket(storageBucket).put(blobName, "");
};

describe.todo("seedBlob");
