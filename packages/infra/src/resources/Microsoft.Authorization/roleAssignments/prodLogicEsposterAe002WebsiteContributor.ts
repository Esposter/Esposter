import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import AzureWebsiteContributorRoleDefinitionId from "@/constants/AzureWebsiteContributorRoleDefinitionId";
import { prodLogicEsposterAe002 } from "@/resources/Microsoft.Logic/workflows/prodLogicEsposterAe002";
import { prodRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import { pShpFuncEsposterAuea001 } from "@/resources/Microsoft.Web/sites/pShpFuncEsposterAuea001";
import { getWorkflowPrincipalId } from "@/services/getWorkflowPrincipalId";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const prodLogicEsposterAe002WebsiteContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "prod-logic-esposter-ae-002-website-contributor",
    {
      principalId: getWorkflowPrincipalId(prodRgEsposterAe001.name, prodLogicEsposterAe002.name),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleDefinitionId: AzureWebsiteContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${pShpRgEsposterAuea001.name}/providers/Microsoft.Web/sites/${pShpFuncEsposterAuea001.name}`,
    },
    {
      parent: prodLogicEsposterAe002,
      protect: true,
    },
  );
