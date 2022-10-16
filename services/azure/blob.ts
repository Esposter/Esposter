import { AppendBlobClient, BlobServiceClient, HttpRequestBody } from "@azure/storage-blob";
import { AzureContainer } from "@/services/azure/types";

export const getContainerClient = async (containerName: AzureContainer) => {
  const runtimeConfig = useRuntimeConfig();
  const blobServiceClient = BlobServiceClient.fromConnectionString(runtimeConfig.azureStorageAccountConnectionString);
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
