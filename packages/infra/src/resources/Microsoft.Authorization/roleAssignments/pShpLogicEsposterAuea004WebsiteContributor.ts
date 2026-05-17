import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import AzureWebsiteContributorRoleDefinitionId from "@/constants/AzureWebsiteContributorRoleDefinitionId";
import { pShpLogicEsposterAuea004 } from "@/resources/Microsoft.Logic/workflows/pShpLogicEsposterAuea004";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import { pShpFuncEsposterAuea001 } from "@/resources/Microsoft.Web/sites/pShpFuncEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const roleAssignmentName = "13b66789-f21f-412d-90bf-603c912ed5d7";

export const pShpLogicEsposterAuea004WebsiteContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "p-shp-logic-esposter-auea-004-website-contributor",
    {
      principalId: pShpLogicEsposterAuea004.identity.apply((identity) => identity?.principalId ?? ""),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName,
      roleDefinitionId: AzureWebsiteContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${pShpRgEsposterAuea001.name}/providers/Microsoft.Web/sites/${pShpFuncEsposterAuea001.name}`,
    },
    {
      protect: true,
    },
  );
