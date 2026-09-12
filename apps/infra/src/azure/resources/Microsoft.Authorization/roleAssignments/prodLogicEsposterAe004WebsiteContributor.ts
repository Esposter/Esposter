import AzureSubscriptionId from "#src/azure/constants/AzureSubscriptionId";
import AzureWebsiteContributorRoleDefinitionId from "#src/azure/constants/AzureWebsiteContributorRoleDefinitionId";
import { prodLogicEsposterAe004 } from "#src/azure/resources/Microsoft.Logic/workflows/prodLogicEsposterAe004";
import { prodRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodFuncEsposter001 } from "#src/azure/resources/Microsoft.Web/sites/prodFuncEsposter001";
import { getPrincipalId } from "#src/azure/services/getPrincipalId";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const prodLogicEsposterAe004WebsiteContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "prod-logic-esposter-ae-004-website-contributor",
    {
      principalId: getPrincipalId(prodLogicEsposterAe004),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleDefinitionId: AzureWebsiteContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${prodRgEsposterAe001.name}/providers/Microsoft.Web/sites/${prodFuncEsposter001.name}`,
    },
    {
      parent: prodFuncEsposter001,
      protect: true,
    },
  );
