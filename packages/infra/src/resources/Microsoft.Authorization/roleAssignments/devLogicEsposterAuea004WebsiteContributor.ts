import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import AzureWebsiteContributorRoleDefinitionId from "@/constants/AzureWebsiteContributorRoleDefinitionId";
import { devLogicEsposterAuea004 } from "@/resources/Microsoft.Logic/workflows/devLogicEsposterAuea004";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import { dShpFuncEsposterAuea001 } from "@/resources/Microsoft.Web/sites/dShpFuncEsposterAuea001";
import { applyPrincipalId } from "@/services/applyPrincipalId";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const devLogicEsposterAuea004WebsiteContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "dev-logic-esposter-auea-004-website-contributor",
    {
      principalId: applyPrincipalId(devLogicEsposterAuea004.identity, devLogicEsposterAuea004.name),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleDefinitionId: AzureWebsiteContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${dShpRgEsposterAuea001.name}/providers/Microsoft.Web/sites/${dShpFuncEsposterAuea001.name}`,
    },
    {
      protect: true,
    },
  );
