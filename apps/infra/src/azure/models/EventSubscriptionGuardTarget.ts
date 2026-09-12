import type { AzureFunction } from "@esposter/db-schema";
import type * as azure_native from "@pulumi/azure-native";

export interface EventSubscriptionGuardTarget {
  azureFunction: AzureFunction;
  eventSubscription: azure_native.eventgrid.EventSubscription;
}
