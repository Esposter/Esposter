import type { AzureContainer } from "@esposter/db-schema";

import { getContainerClient } from "#src/services/azure/getContainerClient";
import { describe } from "vitest";

export const seedBlob = async (containerName: AzureContainer, blobName: string): Promise<void> => {
  const containerClient = await getContainerClient(containerName);
  await containerClient.getBlockBlobClient(blobName).upload("", 0);
};

describe.todo("seedBlob");
