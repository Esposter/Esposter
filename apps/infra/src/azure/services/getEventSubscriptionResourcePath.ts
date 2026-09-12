import { getWorkflowResourceGroupPath } from "#src/azure/services/getWorkflowResourceGroupPath";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const getEventSubscriptionResourcePath = (
  resourceGroup: azure_native.resources.ResourceGroup,
  topic: azure_native.eventgrid.Topic,
  eventSubscription: azure_native.eventgrid.EventSubscription,
): pulumi.Output<string> =>
  pulumi.interpolate`${getWorkflowResourceGroupPath(resourceGroup)}/@{encodeURIComponent('Microsoft.EventGrid')}/@{encodeURIComponent('topics/${topic.name}/eventSubscriptions/${eventSubscription.name}')}`;
