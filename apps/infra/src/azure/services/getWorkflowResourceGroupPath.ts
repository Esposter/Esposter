import AzureSubscriptionId from "#src/azure/constants/AzureSubscriptionId";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

// The ARM path prefix an API connection action addresses a resource group's providers through, each segment
// Wrapped in the workflow language's encodeURIComponent
export const getWorkflowResourceGroupPath = (
  resourceGroup: azure_native.resources.ResourceGroup,
): pulumi.Output<string> =>
  pulumi.interpolate`/subscriptions/@{encodeURIComponent('${AzureSubscriptionId}')}/resourcegroups/@{encodeURIComponent('${resourceGroup.name}')}/providers`;
