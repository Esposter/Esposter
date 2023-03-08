import { AzureContainer } from "@/models/azure/blob";
import { AppendBlobClient, BlobServiceClient, HttpRequestBody } from "@azure/storage-blob";

export const getContainerClient = async (containerName: AzureContainer) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();
  return containerClient;
};

export const appendBlock = async (appendBlobClient: AppendBlobClient, data: HttpRequestBody) => {
  await appendBlobClient.createIfNotExists();
  return appendBlobClient.appendBlock(data, data.toString().length);
};
