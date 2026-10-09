import type { ContainerClient } from "@azure/storage-blob";

import { deleteBlobs } from "#src/services/azure/container/deleteBlobs";
import { listBlobNames } from "#src/services/azure/container/listBlobNames";

export const deleteDirectory = async (containerClient: ContainerClient, prefix = ""): Promise<void> => {
  await deleteBlobs(containerClient, await listBlobNames(containerClient, prefix));
};
