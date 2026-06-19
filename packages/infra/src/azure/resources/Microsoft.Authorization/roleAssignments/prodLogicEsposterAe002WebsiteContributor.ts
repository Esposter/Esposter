import AzureSubscriptionId from "@/azure/constants/AzureSubscriptionId";
import AzureWebsiteContributorRoleDefinitionId from "@/azure/constants/AzureWebsiteContributorRoleDefinitionId";
import ProdLogicEsposterAe002PrincipalId from "@/azure/constants/ProdLogicEsposterAe002PrincipalId";
import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodFuncEsposter001 } from "@/azure/resources/Microsoft.Web/sites/prodFuncEsposter001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const prodLogicEsposterAe002WebsiteContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "prod-logic-esposter-ae-002-website-contributor",
    {
      principalId: ProdLogicEsposterAe002PrincipalId,
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleDefinitionId: AzureWebsiteContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${prodRgEsposterAe001.name}/providers/Microsoft.Web/sites/${prodFuncEsposter001.name}`,
    },
    {
      parent: prodFuncEsposter001,
      protect: true,
    },
  );
