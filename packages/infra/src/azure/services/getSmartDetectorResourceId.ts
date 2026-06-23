import AzureSubscriptionId from "@/azure/constants/AzureSubscriptionId";
import * as pulumi from "@pulumi/pulumi";

export const getSmartDetectorResourceId = (
  resourceGroupName: pulumi.Input<string>,
  providerNamespace: string,
  resourceType: string,
  resourceName: pulumi.Input<string>,
): pulumi.Output<string> =>
  pulumi.interpolate`/subscriptions/${AzureSubscriptionId}/resourcegroups/${resourceGroupName}/providers/${providerNamespace}/${resourceType}/${resourceName}`;
