import type { ContainerClient } from "@azure/storage-blob";

import { describe } from "vitest";

export const uploadBlobs = (containerClient: ContainerClient, blobNames: string[]) =>
  Promise.all(blobNames.map((blobName) => containerClient.getBlockBlobClient(blobName).upload(blobName, 1)));

describe.todo("uploadBlobs");
