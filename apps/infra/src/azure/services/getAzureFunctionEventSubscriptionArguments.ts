import type { AzureFunctionEventSubscriptionArguments } from "#src/azure/models/AzureFunctionEventSubscriptionArguments";
import type { AzureFunction } from "@esposter/db-schema";

import AzureEventSubscriptionRetryPolicy from "#src/azure/constants/AzureEventSubscriptionRetryPolicy";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

// A subscription on the application topic delivers one function's event type to that function, one event per
// Batch, and dead-letters into the environment's deadletter container
export const getAzureFunctionEventSubscriptionArguments = (
  azureFunction: AzureFunction,
  site: azure_native.web.WebApp,
  storageAccount: azure_native.storage.StorageAccount,
  deadLetterContainer: azure_native.storage.BlobContainer,
): AzureFunctionEventSubscriptionArguments => ({
  deadLetterDestination: {
    blobContainerName: deadLetterContainer.name,
    endpointType: "StorageBlob",
    resourceId: storageAccount.id,
  },
  destination: {
    endpointType: "AzureFunction",
    maxEventsPerBatch: 1,
    preferredBatchSizeInKilobytes: 64,
    resourceId: pulumi.interpolate`${site.id}/functions/${azureFunction}`,
  },
  eventDeliverySchema: azure_native.eventgrid.EventDeliverySchema.EventGridSchema,
  filter: {
    enableAdvancedFilteringOnArrays: true,
    includedEventTypes: [azureFunction],
    subjectBeginsWith: "",
    subjectEndsWith: "",
  },
  retryPolicy: AzureEventSubscriptionRetryPolicy,
});
