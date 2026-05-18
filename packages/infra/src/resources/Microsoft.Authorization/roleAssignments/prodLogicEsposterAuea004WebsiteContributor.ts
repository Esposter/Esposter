import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import AzureWebsiteContributorRoleDefinitionId from "@/constants/AzureWebsiteContributorRoleDefinitionId";
import { prodLogicEsposterAuea004 } from "@/resources/Microsoft.Logic/workflows/prodLogicEsposterAuea004";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import { pShpFuncEsposterAuea001 } from "@/resources/Microsoft.Web/sites/pShpFuncEsposterAuea001";
import { applyPrincipalId } from "@/services/applyPrincipalId";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const prodLogicEsposterAuea004WebsiteContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "prod-logic-esposter-auea-004-website-contributor",
    {
      principalId: applyPrincipalId(prodLogicEsposterAuea004.identity, prodLogicEsposterAuea004.name),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleDefinitionId: AzureWebsiteContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${pShpRgEsposterAuea001.name}/providers/Microsoft.Web/sites/${pShpFuncEsposterAuea001.name}`,
    },
    {
      protect: true,
    },
  );
