import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import AzureWebsiteContributorRoleDefinitionId from "@/constants/AzureWebsiteContributorRoleDefinitionId";
import ProdLogicEsposterAe004PrincipalId from "@/constants/ProdLogicEsposterAe004PrincipalId";
import { prodRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodFuncEsposter001 } from "@/resources/Microsoft.Web/sites/prodFuncEsposter001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const prodLogicEsposterAe004WebsiteContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "prod-logic-esposter-ae-004-website-contributor",
    {
      principalId: ProdLogicEsposterAe004PrincipalId,
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleDefinitionId: AzureWebsiteContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${prodRgEsposterAe001.name}/providers/Microsoft.Web/sites/${prodFuncEsposter001.name}`,
    },
    {
      parent: prodFuncEsposter001,
      protect: true,
    },
  );
