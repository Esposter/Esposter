import type { EventSubscriptionGuardTarget } from "#src/azure/models/EventSubscriptionGuardTarget";
import type * as azure_native from "@pulumi/azure-native";

export interface EventSubscriptionRestoreOptions {
  connection: azure_native.web.Connection;
  deadLetterContainer: azure_native.storage.BlobContainer;
  resourceGroup: azure_native.resources.ResourceGroup;
  site: azure_native.web.WebApp;
  storageAccount: azure_native.storage.StorageAccount;
  targets: EventSubscriptionGuardTarget[];
  topic: azure_native.eventgrid.Topic;
}
