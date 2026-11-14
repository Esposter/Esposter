import type { AzureContainer } from "#src/azure/models/AzureContainer";

// Blob storage's BlobCreated/BlobDeleted subject prefix, which the live subscriptions filter on
export const getBlobSubjectPrefix = (containerName: AzureContainer) =>
  `/blobServices/default/containers/${containerName}/blobs/`;
