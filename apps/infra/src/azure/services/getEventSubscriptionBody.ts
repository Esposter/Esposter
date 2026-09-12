import type { AzureFunctionEventSubscriptionArguments } from "#src/azure/models/AzureFunctionEventSubscriptionArguments";
import type { EventSubscriptionRestoreBody } from "#src/azure/models/EventSubscriptionRestoreBody";

// The REST body nests each destination's settings under `properties` where the Pulumi resource flattens them
export const getEventSubscriptionBody = ({
  deadLetterDestination: { endpointType: deadLetterEndpointType, ...deadLetterProperties },
  destination: { endpointType: destinationEndpointType, ...destinationProperties },
  ...properties
}: AzureFunctionEventSubscriptionArguments): EventSubscriptionRestoreBody => ({
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
  },
});
