import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { dShpEvgtEsposterAuea001 } from "@/resources/Microsoft.EventGrid/topics/dShpEvgtEsposterAuea001";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import { dShpFuncEsposterAuea001 } from "@/resources/Microsoft.Web/sites/dShpFuncEsposterAuea001";
import { AzureFunction } from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const eventSubscriptionName = "dev-evgs-esposter-ae-002";

export const devEvgsEsposterAe002: azure_native.eventgrid.EventSubscription =
  new azure_native.eventgrid.EventSubscription(
    eventSubscriptionName,
    {
      destination: {
        endpointType: "AzureFunction",
        maxEventsPerBatch: 1,
        preferredBatchSizeInKilobytes: 64,
        resourceId: pulumi.interpolate`${dShpFuncEsposterAuea001.id}/functions/${AzureFunction.ProcessPushNotification}`,
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
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${dShpRgEsposterAuea001.name}/providers/Microsoft.EventGrid/topics/${dShpEvgtEsposterAuea001.name}`,
    },
    {
      protect: true,
    },
  );
