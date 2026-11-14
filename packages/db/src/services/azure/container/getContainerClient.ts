import type { ContainerClient } from "@azure/storage-blob";
import type { StorageBucket } from "@esposter/db-schema";

import { syncProperties } from "#src/services/azure/container/syncProperties";
import { createProvisionedClientCache } from "#src/services/azure/createProvisionedClientCache";
import { BlobServiceClient } from "@azure/storage-blob";
import { StorageBucketPropertiesMap } from "@esposter/db-schema";

const provisionContainerClient = async (connectionString: string, storageBucket: StorageBucket) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(storageBucket);
  const containerCreateOptions = StorageBucketPropertiesMap[storageBucket];
  await containerClient.createIfNotExists(containerCreateOptions);
  await syncProperties(containerClient, containerCreateOptions);
  return containerClient;
};

export const getContainerClient: (connectionString: string, storageBucket: StorageBucket) => Promise<ContainerClient> =
  createProvisionedClientCache(provisionContainerClient);
