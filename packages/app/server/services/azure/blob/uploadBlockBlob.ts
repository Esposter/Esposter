import type { ContainerClient, HttpRequestBody } from "@azure/storage-blob";

export const uploadBlockBlob = (
  containerClient: ContainerClient,
  blobName: string,
  data: NonNullable<HttpRequestBody>,
) => containerClient.uploadBlockBlob(blobName, data, data.toString().length);
