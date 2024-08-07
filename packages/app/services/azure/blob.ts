import type { AzureContainer } from "@/models/azure/blob";
import type { ContainerClient, HttpRequestBody } from "@azure/storage-blob";

import { BlobServiceClient } from "@azure/storage-blob";

const runtimeConfig = useRuntimeConfig();

export const getContainerClient = async (containerName: AzureContainer) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(runtimeConfig.azure.storageAccountConnectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();
  return containerClient;
};

export const uploadBlockBlob = (
  containerClient: ContainerClient,
  blobName: string,
  data: NonNullable<HttpRequestBody>,
) => containerClient.uploadBlockBlob(blobName, data, data.toString().length);
