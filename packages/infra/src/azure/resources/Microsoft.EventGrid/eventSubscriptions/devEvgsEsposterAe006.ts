import AzureEventSubscriptionRetryPolicy from "@/azure/constants/AzureEventSubscriptionRetryPolicy";
import AzureSubscriptionId from "@/azure/constants/AzureSubscriptionId";
import { devEvgtEsposterAe001 } from "@/azure/resources/Microsoft.EventGrid/topics/devEvgtEsposterAe001";
import { devRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devstesposter001Deadletter } from "@/azure/resources/Microsoft.Storage/storageAccounts/blobContainers/devstesposter001Deadletter";
import { devstesposter001 } from "@/azure/resources/Microsoft.Storage/storageAccounts/devstesposter001";
import { devFuncEsposter001 } from "@/azure/resources/Microsoft.Web/sites/devFuncEsposter001";
import { AzureFunction } from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const eventSubscriptionName = "dev-evgs-esposter-ae-006";

export const devEvgsEsposterAe006: azure_native.eventgrid.EventSubscription =
  new azure_native.eventgrid.EventSubscription(
    eventSubscriptionName,
    {
      deadLetterDestination: {
        blobContainerName: devstesposter001Deadletter.name,
        endpointType: "StorageBlob",
        resourceId: devstesposter001.id,
      },
      destination: {
        endpointType: "AzureFunction",
        maxEventsPerBatch: 1,
        preferredBatchSizeInKilobytes: 64,
        resourceId: pulumi.interpolate`${devFuncEsposter001.id}/functions/${AzureFunction.ProcessBlobDeletion}`,
      },
      eventDeliverySchema: azure_native.eventgrid.EventDeliverySchema.EventGridSchema,
      eventSubscriptionName,
      filter: {
        enableAdvancedFilteringOnArrays: true,
        includedEventTypes: [AzureFunction.ProcessBlobDeletion],
        subjectBeginsWith: "",
        subjectEndsWith: "",
      },
      retryPolicy: AzureEventSubscriptionRetryPolicy,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${devRgEsposterAe001.name}/providers/Microsoft.EventGrid/topics/${devEvgtEsposterAe001.name}`,
    },
    {
      parent: devEvgtEsposterAe001,
      protect: true,
    },
  );
