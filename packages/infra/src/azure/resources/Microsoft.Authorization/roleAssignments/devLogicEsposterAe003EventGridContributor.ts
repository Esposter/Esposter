import AzureEventGridContributorRoleDefinitionId from "@/azure/constants/AzureEventGridContributorRoleDefinitionId";
import AzureSubscriptionId from "@/azure/constants/AzureSubscriptionId";
import DevLogicEsposterAe003PrincipalId from "@/azure/constants/DevLogicEsposterAe003PrincipalId";
import { devEvgtEsposterAe001 } from "@/azure/resources/Microsoft.EventGrid/topics/devEvgtEsposterAe001";
import { devRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

// EventGrid Contributor, deliberately not the narrower EventGrid EventSubscription Contributor this
// Resource's Pulumi NAME still reads: that name is part of the resource's identity, so changing it would
// Replace a `protect: true` role assignment rather than rename it. The role is what the assignment grants
export const devLogicEsposterAe003EventGridContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "dev-logic-esposter-ae-003-event-grid-event-subscription-contributor",
    {
      principalId: DevLogicEsposterAe003PrincipalId,
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleDefinitionId: AzureEventGridContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${devRgEsposterAe001.name}/providers/Microsoft.EventGrid/topics/${devEvgtEsposterAe001.name}`,
    },
    {
      parent: devEvgtEsposterAe001,
      protect: true,
    },
  );
