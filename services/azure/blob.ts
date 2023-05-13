import type { AzureContainer } from "@/models/azure/blob";
import { BlobServiceClient, ContainerClient, HttpRequestBody } from "@azure/storage-blob";

export const getContainerClient = async (containerName: AzureContainer) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();
  return containerClient;
};

export const uploadBlockBlob = (containerClient: ContainerClient, blobName: string, data: HttpRequestBody) =>
  containerClient.uploadBlockBlob(blobName, data, data.toString().length);
