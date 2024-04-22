import { env } from "@/env.server";
import type { AzureContainer } from "@/models/azure/blob";
import type { ContainerClient, HttpRequestBody } from "@azure/storage-blob";
import { BlobServiceClient } from "@azure/storage-blob";

export const getContainerClient = async (containerName: AzureContainer) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();
  return containerClient;
};

export const uploadBlockBlob = (containerClient: ContainerClient, blobName: string, data: HttpRequestBody) =>
  containerClient.uploadBlockBlob(blobName, data, data.toString().length);
