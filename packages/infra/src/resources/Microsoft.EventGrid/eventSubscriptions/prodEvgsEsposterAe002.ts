import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { prodEvgtEsposterAe001 } from "@/resources/Microsoft.EventGrid/topics/prodEvgtEsposterAe001";
import { prodRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodFuncEsposter001 } from "@/resources/Microsoft.Web/sites/prodFuncEsposter001";
import { AzureFunction } from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const eventSubscriptionName = "prod-evgs-esposter-ae-002";

export const prodEvgsEsposterAe002: azure_native.eventgrid.EventSubscription =
  new azure_native.eventgrid.EventSubscription(
    eventSubscriptionName,
    {
      destination: {
        endpointType: "AzureFunction",
        maxEventsPerBatch: 1,
        preferredBatchSizeInKilobytes: 64,
        resourceId: pulumi.interpolate`${prodFuncEsposter001.id}/functions/${AzureFunction.ProcessPushNotification}`,
      },
      eventDeliverySchema: azure_native.eventgrid.EventDeliverySchema.EventGridSchema,
      eventSubscriptionName,
      filter: {
        enableAdvancedFilteringOnArrays: true,
        includedEventTypes: [AzureFunction.ProcessPushNotification],
        subjectBeginsWith: "",
        subjectEndsWith: "",
      },
      retryPolicy: {
        eventTimeToLiveInMinutes: 1440,
        maxDeliveryAttempts: 30,
      },
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${prodRgEsposterAe001.name}/providers/Microsoft.EventGrid/topics/${prodEvgtEsposterAe001.name}`,
    },
    {
      parent: prodEvgtEsposterAe001,
      protect: true,
    },
  );
