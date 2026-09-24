import type * as azure_native from "@pulumi/azure-native";

export const getStorageBlobDeadLetterDestination = (
  storageAccount: azure_native.storage.StorageAccount,
  deadLetterContainer: azure_native.storage.BlobContainer,
): azure_native.types.input.eventgrid.StorageBlobDeadLetterDestinationArgs => ({
  blobContainerName: deadLetterContainer.name,
  endpointType: "StorageBlob",
  resourceId: storageAccount.id,
});
