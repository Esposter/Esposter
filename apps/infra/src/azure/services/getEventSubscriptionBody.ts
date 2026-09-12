import type { AzureFunctionEventSubscriptionArguments } from "#src/azure/models/AzureFunctionEventSubscriptionArguments";
import type { EventSubscriptionRestoreBody } from "#src/azure/models/EventSubscriptionRestoreBody";
import type * as azure_native from "@pulumi/azure-native";

// The REST body nests each destination's settings under `properties` where the Pulumi resource flattens them
export const getEventSubscriptionBody = (
  resourceGroup: azure_native.resources.ResourceGroup,
  topic: azure_native.eventgrid.Topic,
  eventSubscription: azure_native.eventgrid.EventSubscription,
  {
    deadLetterDestination: { endpointType: deadLetterEndpointType, ...deadLetterProperties },
    destination: { endpointType: destinationEndpointType, ...destinationProperties },
    ...properties
  }: AzureFunctionEventSubscriptionArguments,
): EventSubscriptionRestoreBody => ({
  properties: {
    ...properties,
    deadLetterDestination: {
      endpointType: deadLetterEndpointType,
      properties: deadLetterProperties,
    },
    destination: {
      endpointType: destinationEndpointType,
      properties: destinationProperties,
    },
    id: eventSubscription.id,
    name: eventSubscription.name,
    resourceGroup: resourceGroup.name,
    topic: topic.id,
    type: "Microsoft.EventGrid/eventSubscriptions",
  },
});
