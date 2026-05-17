import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { pShpEvgtEsposterAuea001 } from "@/resources/Microsoft.EventGrid/topics/pShpEvgtEsposterAuea001";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import { pShpFuncEsposterAuea001 } from "@/resources/Microsoft.Web/sites/pShpFuncEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const pShpEvgtsEsposterAuea001: azure_native.eventgrid.EventSubscription =
  new azure_native.eventgrid.EventSubscription(
    "p-shp-evgts-esposter-auea-001",
    {
      destination: {
        endpointType: "AzureFunction",
        maxEventsPerBatch: 1,
        preferredBatchSizeInKilobytes: 64,
        resourceId: pulumi.interpolate`${pShpFuncEsposterAuea001.id}/functions/ProcessWebhook`,
      },
      eventDeliverySchema: azure_native.eventgrid.EventDeliverySchema.EventGridSchema,
      eventSubscriptionName: "p-shp-evgts-esposter-auea-001",
      filter: {
        enableAdvancedFilteringOnArrays: true,
        includedEventTypes: ["ProcessWebhook"],
        subjectBeginsWith: "",
        subjectEndsWith: "",
      },
      retryPolicy: {
        eventTimeToLiveInMinutes: 1440,
        maxDeliveryAttempts: 30,
      },
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${pShpRgEsposterAuea001.name}/providers/Microsoft.EventGrid/topics/${pShpEvgtEsposterAuea001.name}`,
    },
    {
      protect: true,
    },
  );
