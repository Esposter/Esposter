import type { EventSubscriptionGuardTarget } from "#src/azure/models/EventSubscriptionGuardTarget";

import { AzureFunction } from "#src/azure/models/AzureFunction";
import { prodEvgsEsposterAe001 } from "#src/azure/resources/Microsoft.EventGrid/eventSubscriptions/prodEvgsEsposterAe001";
import { prodEvgsEsposterAe002 } from "#src/azure/resources/Microsoft.EventGrid/eventSubscriptions/prodEvgsEsposterAe002";

const ProdEventSubscriptionGuardTargets: EventSubscriptionGuardTarget[] = [
  { azureFunction: AzureFunction.ProcessNotification, eventSubscription: prodEvgsEsposterAe002 },
  { azureFunction: AzureFunction.ProcessWebhook, eventSubscription: prodEvgsEsposterAe001 },
];

export default ProdEventSubscriptionGuardTargets;
