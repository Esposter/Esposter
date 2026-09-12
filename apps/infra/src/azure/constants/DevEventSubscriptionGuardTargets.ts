import type { EventSubscriptionGuardTarget } from "#src/azure/models/EventSubscriptionGuardTarget";

import { devEvgsEsposterAe001 } from "#src/azure/resources/Microsoft.EventGrid/eventSubscriptions/devEvgsEsposterAe001";
import { devEvgsEsposterAe002 } from "#src/azure/resources/Microsoft.EventGrid/eventSubscriptions/devEvgsEsposterAe002";
import { AzureFunction } from "@esposter/db-schema";

// The metered subscriptions the budget guard tears down and its restore workflow recreates: one list, so a
// Subscription cannot be deleted by the one without being brought back by the other
const DevEventSubscriptionGuardTargets: EventSubscriptionGuardTarget[] = [
  { azureFunction: AzureFunction.ProcessNotification, eventSubscription: devEvgsEsposterAe002 },
  { azureFunction: AzureFunction.ProcessWebhook, eventSubscription: devEvgsEsposterAe001 },
];

export default DevEventSubscriptionGuardTargets;
