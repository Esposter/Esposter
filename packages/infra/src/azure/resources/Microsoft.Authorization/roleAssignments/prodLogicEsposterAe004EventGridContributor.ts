import AzureEventGridContributorRoleDefinitionId from "#src/azure/constants/AzureEventGridContributorRoleDefinitionId";
import AzureSubscriptionId from "#src/azure/constants/AzureSubscriptionId";
import ProdLogicEsposterAe004PrincipalId from "#src/azure/constants/ProdLogicEsposterAe004PrincipalId";
import { prodEvgtEsposterAe001 } from "#src/azure/resources/Microsoft.EventGrid/topics/prodEvgtEsposterAe001";
import { prodRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

// EventGrid Contributor, deliberately not the narrower EventGrid EventSubscription Contributor this
// Resource's Pulumi NAME still reads: that name is part of the resource's identity, so changing it would
// Replace a `protect: true` role assignment rather than rename it. The role is what the assignment grants
export const prodLogicEsposterAe004EventGridContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "prod-logic-esposter-ae-004-event-grid-event-subscription-contributor",
    {
      principalId: ProdLogicEsposterAe004PrincipalId,
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleDefinitionId: AzureEventGridContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${prodRgEsposterAe001.name}/providers/Microsoft.EventGrid/topics/${prodEvgtEsposterAe001.name}`,
    },
    {
      parent: prodEvgtEsposterAe001,
      protect: true,
    },
  );
