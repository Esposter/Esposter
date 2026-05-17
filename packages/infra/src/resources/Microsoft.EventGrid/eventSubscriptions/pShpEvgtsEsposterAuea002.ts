import * as azure_native from "@pulumi/azure-native";

export const pShpEvgtsEsposterAuea002: azure_native.eventgrid.EventSubscription =
  new azure_native.eventgrid.EventSubscription(
    "p-shp-evgts-esposter-auea-002",
    {
      destination: {
        endpointType: "AzureFunction",
        maxEventsPerBatch: 1,
        preferredBatchSizeInKilobytes: 64,
        resourceId:
          "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/p-shp-rg-esposter-auea-001/providers/Microsoft.Web/sites/p-shp-func-esposter-auea-001/functions/ProcessPushNotification",
      },
      eventDeliverySchema: azure_native.eventgrid.EventDeliverySchema.EventGridSchema,
      eventSubscriptionName: "p-shp-evgts-esposter-auea-002",
      filter: {
        enableAdvancedFilteringOnArrays: true,
        includedEventTypes: ["ProcessPushNotification"],
        subjectBeginsWith: "",
        subjectEndsWith: "",
      },
      retryPolicy: {
        eventTimeToLiveInMinutes: 1440,
        maxDeliveryAttempts: 30,
      },
      scope:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/p-shp-rg-esposter-auea-001/providers/Microsoft.EventGrid/topics/p-shp-evgt-esposter-auea-001",
    },
    {
      protect: true,
    },
  );
