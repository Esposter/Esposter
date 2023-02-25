import { AzureContainer } from "@/models/azure/blob";
import { AppendBlobClient, BlobServiceClient, HttpRequestBody } from "@azure/storage-blob";

export const getContainerClient = async (containerName: AzureContainer) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();
  return containerClient;
};

export const append = async (appendBlobClient: AppendBlobClient, data: HttpRequestBody) => {
  await appendBlobClient.createIfNotExists();
  const response = await appendBlobClient.appendBlock(data, data.toString().length);
  const error = response._response.status >= 400;
  if (error) console.error(`Failed to append data to blob ${appendBlobClient.name}`);
  return !error;
};
