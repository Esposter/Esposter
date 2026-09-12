import type { ApiConnectionAction } from "#src/azure/models/ApiConnectionAction";
import type { AzureFunctionEventSubscriptionArguments } from "#src/azure/models/AzureFunctionEventSubscriptionArguments";
import type { EventSubscriptionRestoreOptions } from "#src/azure/models/EventSubscriptionRestoreOptions";

import AzureEventGridApiVersion from "#src/azure/constants/AzureEventGridApiVersion";
import { HttpMethod } from "#src/azure/models/HttpMethod";
import { getApiConnectionAction } from "#src/azure/services/getApiConnectionAction";
import { getAzureFunctionEventSubscriptionArguments } from "#src/azure/services/getAzureFunctionEventSubscriptionArguments";
import { getEventSubscriptionResourcePath } from "#src/azure/services/getEventSubscriptionResourcePath";
import * as azure_native from "@pulumi/azure-native";

// The REST body nests each destination's settings under `properties` where the Pulumi resource flattens them
const getEventSubscriptionBody = (
  resourceGroup: azure_native.resources.ResourceGroup,
  topic: azure_native.eventgrid.Topic,
  eventSubscription: azure_native.eventgrid.EventSubscription,
  {
    deadLetterDestination: { endpointType: deadLetterEndpointType, ...deadLetterProperties },
    destination: { endpointType: destinationEndpointType, ...destinationProperties },
    ...properties
  }: AzureFunctionEventSubscriptionArguments,
) => ({
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

// Each target is read first and recreated only when the read fails, so a subscription the guard never deleted
// Is left untouched
export const getEventSubscriptionRestoreActions = ({
  connection,
  deadLetterContainer,
  resourceGroup,
  site,
  storageAccount,
  targets,
  topic,
}: EventSubscriptionRestoreOptions): Record<string, ApiConnectionAction> =>
  Object.fromEntries(
    targets.flatMap(({ azureFunction, eventSubscription }) => {
      const path = getEventSubscriptionResourcePath(resourceGroup, topic, eventSubscription);
      const queries = { "x-ms-api-version": AzureEventGridApiVersion };
      const readKey = `Read_${azureFunction}_Event_Subscription`;
      const eventSubscriptionArguments = getAzureFunctionEventSubscriptionArguments(
        azureFunction,
        site,
        storageAccount,
        deadLetterContainer,
      );
      const body = getEventSubscriptionBody(resourceGroup, topic, eventSubscription, eventSubscriptionArguments);
      return [
        [
          `Create_${azureFunction}_Event_Subscription`,
          getApiConnectionAction({
            body,
            connection,
            method: HttpMethod.Put,
            path,
            queries,
            runAfter: { [readKey]: ["Failed"] },
          }),
        ],
        [readKey, getApiConnectionAction({ connection, method: HttpMethod.Get, path, queries })],
      ];
    }),
  );
