import type { StorageBucket } from "@esposter/db-schema";

import { getContainerClient } from "#src/services/azure/getContainerClient";
import { describe } from "vitest";

export const seedBlob = async (containerName: StorageBucket, blobName: string): Promise<void> => {
  const containerClient = await getContainerClient(containerName);
  await containerClient.getBlockBlobClient(blobName).upload("", 0);
};

describe.todo("seedBlob");
