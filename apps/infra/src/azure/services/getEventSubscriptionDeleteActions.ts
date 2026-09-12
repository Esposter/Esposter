import type { ApiConnectionAction } from "#src/azure/models/ApiConnectionAction";
import type { EventSubscriptionGuardTarget } from "#src/azure/models/EventSubscriptionGuardTarget";

import AzureEventGridApiVersion from "#src/azure/constants/AzureEventGridApiVersion";
import { HttpMethod } from "#src/azure/models/HttpMethod";
import { getApiConnectionAction } from "#src/azure/services/getApiConnectionAction";
import { getEventSubscriptionResourcePath } from "#src/azure/services/getEventSubscriptionResourcePath";
import * as azure_native from "@pulumi/azure-native";

export const getEventSubscriptionDeleteActions = (
  connection: azure_native.web.Connection,
  resourceGroup: azure_native.resources.ResourceGroup,
  topic: azure_native.eventgrid.Topic,
  targets: EventSubscriptionGuardTarget[],
): Record<string, ApiConnectionAction> =>
  Object.fromEntries(
    targets.map(({ azureFunction, eventSubscription }) => [
      `Delete_${azureFunction}_Event_Subscription`,
      getApiConnectionAction({
        connection,
        method: HttpMethod.Delete,
        path: getEventSubscriptionResourcePath(resourceGroup, topic, eventSubscription),
        queries: {
          "x-ms-api-version": AzureEventGridApiVersion,
        },
      }),
    ]),
  );
