import AzureSubscriptionId from "@/azure/constants/AzureSubscriptionId";
import { prodEvgtEsposterAe001 } from "@/azure/resources/Microsoft.EventGrid/topics/prodEvgtEsposterAe001";
import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodstesposter001Deadletter } from "@/azure/resources/Microsoft.Storage/storageAccounts/blobContainers/prodstesposter001Deadletter";
import { prodstesposter001 } from "@/azure/resources/Microsoft.Storage/storageAccounts/prodstesposter001";
import { prodFuncEsposter001 } from "@/azure/resources/Microsoft.Web/sites/prodFuncEsposter001";
import { AzureFunction } from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const eventSubscriptionName = "prod-evgs-esposter-ae-003";

export const prodEvgsEsposterAe003: azure_native.eventgrid.EventSubscription =
  new azure_native.eventgrid.EventSubscription(
    eventSubscriptionName,
    {
      deadLetterDestination: {
        blobContainerName: prodstesposter001Deadletter.name,
        endpointType: "StorageBlob",
        resourceId: prodstesposter001.id,
      },
      destination: {
        endpointType: "AzureFunction",
        maxEventsPerBatch: 1,
        preferredBatchSizeInKilobytes: 64,
        resourceId: pulumi.interpolate`${prodFuncEsposter001.id}/functions/${AzureFunction.ProcessFriendRequestNotification}`,
      },
      eventDeliverySchema: azure_native.eventgrid.EventDeliverySchema.EventGridSchema,
      eventSubscriptionName,
      filter: {
        enableAdvancedFilteringOnArrays: true,
        includedEventTypes: [AzureFunction.ProcessFriendRequestNotification],
        subjectBeginsWith: "",
        subjectEndsWith: "",
      },
      retryPolicy: {
        eventTimeToLiveInMinutes: 60,
        maxDeliveryAttempts: 10,
      },
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${prodRgEsposterAe001.name}/providers/Microsoft.EventGrid/topics/${prodEvgtEsposterAe001.name}`,
    },
    {
      parent: prodEvgtEsposterAe001,
      protect: true,
    },
  );
