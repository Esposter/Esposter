import type { AzureFunction } from "@esposter/db-schema";
import type * as azure_native from "@pulumi/azure-native";

import * as pulumi from "@pulumi/pulumi";

export const getAzureFunctionEventSubscriptionDestination = (
  azureFunction: AzureFunction,
  site: azure_native.web.WebApp,
): azure_native.types.input.eventgrid.AzureFunctionEventSubscriptionDestinationArgs => ({
  endpointType: "AzureFunction",
  maxEventsPerBatch: 1,
  preferredBatchSizeInKilobytes: 64,
  resourceId: pulumi.interpolate`${site.id}/functions/${azureFunction}`,
});
