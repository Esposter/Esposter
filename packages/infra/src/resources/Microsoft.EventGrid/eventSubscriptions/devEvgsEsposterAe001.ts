import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { devEvgtEsposterAe001 } from "@/resources/Microsoft.EventGrid/topics/devEvgtEsposterAe001";
import { devRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devFuncEsposter001 } from "@/resources/Microsoft.Web/sites/devFuncEsposter001";
import { AzureFunction } from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const eventSubscriptionName = "dev-evgs-esposter-ae-001";

export const devEvgsEsposterAe001: azure_native.eventgrid.EventSubscription =
  new azure_native.eventgrid.EventSubscription(
    eventSubscriptionName,
    {
      destination: {
        endpointType: "AzureFunction",
        maxEventsPerBatch: 1,
        preferredBatchSizeInKilobytes: 64,
        resourceId: pulumi.interpolate`${devFuncEsposter001.id}/functions/${AzureFunction.ProcessWebhook}`,
      },
      eventDeliverySchema: azure_native.eventgrid.EventDeliverySchema.EventGridSchema,
      eventSubscriptionName,
      filter: {
        enableAdvancedFilteringOnArrays: true,
        includedEventTypes: [AzureFunction.ProcessWebhook],
        subjectBeginsWith: "",
        subjectEndsWith: "",
      },
      retryPolicy: {
        eventTimeToLiveInMinutes: 1440,
        maxDeliveryAttempts: 30,
      },
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${devRgEsposterAe001.name}/providers/Microsoft.EventGrid/topics/${devEvgtEsposterAe001.name}`,
    },
    {
      parent: devEvgtEsposterAe001,
      protect: true,
    },
  );
