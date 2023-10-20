import type { AzureContainer } from "@/models/azure/blob";
import type { HttpRequestBody } from "@azure/storage-blob";
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";

const runtimeConfig = useRuntimeConfig();

export const getContainerClient = async (containerName: AzureContainer) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(runtimeConfig.azure.storageAccountConnectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();
  return containerClient;
};

export const uploadBlockBlob = (containerClient: ContainerClient, blobName: string, data: HttpRequestBody) =>
  containerClient.uploadBlockBlob(blobName, data, data.toString().length);
