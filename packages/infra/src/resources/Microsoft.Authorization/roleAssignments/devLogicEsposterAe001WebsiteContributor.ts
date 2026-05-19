import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import AzureWebsiteContributorRoleDefinitionId from "@/constants/AzureWebsiteContributorRoleDefinitionId";
import { devLogicEsposterAe001 } from "@/resources/Microsoft.Logic/workflows/devLogicEsposterAe001";
import { devRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import { dShpFuncEsposterAuea001 } from "@/resources/Microsoft.Web/sites/dShpFuncEsposterAuea001";
import { getWorkflowPrincipalId } from "@/services/getWorkflowPrincipalId";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const devLogicEsposterAe001WebsiteContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "dev-logic-esposter-ae-001-website-contributor",
    {
      principalId: getWorkflowPrincipalId(devRgEsposterAe001.name, devLogicEsposterAe001.name),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleDefinitionId: AzureWebsiteContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${dShpRgEsposterAuea001.name}/providers/Microsoft.Web/sites/${dShpFuncEsposterAuea001.name}`,
    },
    {
      parent: devLogicEsposterAe001,
      protect: true,
    },
  );
