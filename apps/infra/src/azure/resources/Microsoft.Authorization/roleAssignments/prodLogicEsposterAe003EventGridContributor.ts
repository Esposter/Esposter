import AzureEventGridContributorRoleDefinitionId from "#src/azure/constants/AzureEventGridContributorRoleDefinitionId";
import AzureSubscriptionId from "#src/azure/constants/AzureSubscriptionId";
import { prodEvgtEsposterAe001 } from "#src/azure/resources/Microsoft.EventGrid/topics/prodEvgtEsposterAe001";
import { prodLogicEsposterAe003 } from "#src/azure/resources/Microsoft.Logic/workflows/prodLogicEsposterAe003";
import { prodRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { getPrincipalId } from "#src/azure/services/getPrincipalId";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const prodLogicEsposterAe003EventGridContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "prod-logic-esposter-ae-003-event-grid-event-subscription-contributor",
    {
      principalId: getPrincipalId(prodLogicEsposterAe003),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleDefinitionId: AzureEventGridContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${prodRgEsposterAe001.name}/providers/Microsoft.EventGrid/topics/${prodEvgtEsposterAe001.name}`,
    },
    {
      parent: prodEvgtEsposterAe001,
      protect: true,
    },
  );
