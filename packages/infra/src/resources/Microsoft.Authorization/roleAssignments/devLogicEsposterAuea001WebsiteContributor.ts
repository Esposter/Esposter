import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import AzureWebsiteContributorRoleDefinitionId from "@/constants/AzureWebsiteContributorRoleDefinitionId";
import { devLogicEsposterAuea001 } from "@/resources/Microsoft.Logic/workflows/devLogicEsposterAuea001";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import { dShpFuncEsposterAuea001 } from "@/resources/Microsoft.Web/sites/dShpFuncEsposterAuea001";
import { getWorkflowPrincipalId } from "@/services/getWorkflowPrincipalId";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const roleAssignmentName = "46d16073-bc6c-a66a-99d3-4badf1da1438";

export const devLogicEsposterAuea001WebsiteContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "dev-logic-esposter-auea-001-website-contributor",
    {
      principalId: getWorkflowPrincipalId(dShpRgEsposterAuea001.name, devLogicEsposterAuea001.name),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName,
      roleDefinitionId: AzureWebsiteContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${dShpRgEsposterAuea001.name}/providers/Microsoft.Web/sites/${dShpFuncEsposterAuea001.name}`,
    },
    {
      protect: true,
    },
  );
