import * as azure_native from "@pulumi/azure-native";

export const dShpEvgtsEsposterAuea001: azure_native.eventgrid.EventSubscription =
  new azure_native.eventgrid.EventSubscription(
    "d-shp-evgts-esposter-auea-001",
    {
      destination: {
        endpointType: "AzureFunction",
        maxEventsPerBatch: 1,
        preferredBatchSizeInKilobytes: 64,
        resourceId:
          "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001/providers/Microsoft.Web/sites/d-shp-func-esposter-auea-001/functions/ProcessWebhook",
      },
      eventDeliverySchema: azure_native.eventgrid.EventDeliverySchema.EventGridSchema,
      eventSubscriptionName: "d-shp-evgts-esposter-auea-001",
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
      scope:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001/providers/Microsoft.EventGrid/topics/d-shp-evgt-esposter-auea-001",
    },
    {
      protect: true,
    },
  );
