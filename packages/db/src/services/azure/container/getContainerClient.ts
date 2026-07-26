import type { ContainerClient } from "@azure/storage-blob";
import type { AzureContainer } from "@esposter/db-schema";

import { syncProperties } from "@/services/azure/container/syncProperties";
import { BlobServiceClient } from "@azure/storage-blob";
import { AzureContainerPropertiesMap } from "@esposter/db-schema";
import { getResultAsync, ID_SEPARATOR } from "@esposter/shared";

const provisionContainerClient = async (connectionString: string, azureContainer: AzureContainer) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(azureContainer);
  const containerCreateOptions = AzureContainerPropertiesMap[azureContainer];
  await containerClient.createIfNotExists(containerCreateOptions);
  await syncProperties(containerClient, containerCreateOptions);
  return containerClient;
};

// Provisioning is one-time setup for a fixed resource, but every storage-touching request pays for it: a
// Container create plus an access-policy read before the operation the caller actually wanted. On the asset
// Endpoint that is once per embedded image, so a published page with dozens of assets issues dozens of each
// And invites account-level throttling. Memoizing the promise — not the resolved client — also means
// Concurrent callers share one round trip instead of racing their own
const containerClientMap = new Map<string, Promise<ContainerClient>>();

export const getContainerClient = (
  connectionString: string,
  azureContainer: AzureContainer,
): Promise<ContainerClient> => {
  const key = `${connectionString}${ID_SEPARATOR}${azureContainer}`;
  const containerClientPromise =
    containerClientMap.get(key) ?? provisionContainerClient(connectionString, azureContainer);
  containerClientMap.set(key, containerClientPromise);
  // A failed provision must not be remembered — the next caller has to be able to retry it.
  return getResultAsync(() => containerClientPromise).match(
    (containerClient) => containerClient,
    (error) => {
      containerClientMap.delete(key);
      throw error;
    },
  );
};
