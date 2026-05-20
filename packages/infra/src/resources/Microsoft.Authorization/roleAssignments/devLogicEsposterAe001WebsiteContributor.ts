import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import AzureWebsiteContributorRoleDefinitionId from "@/constants/AzureWebsiteContributorRoleDefinitionId";
import DevLogicEsposterAe001PrincipalId from "@/constants/DevLogicEsposterAe001PrincipalId";
import { devLogicEsposterAe001 } from "@/resources/Microsoft.Logic/workflows/devLogicEsposterAe001";
import { devRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devFuncEsposter001 } from "@/resources/Microsoft.Web/sites/devFuncEsposter001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const devLogicEsposterAe001WebsiteContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "dev-logic-esposter-ae-001-website-contributor",
    {
      principalId: DevLogicEsposterAe001PrincipalId,
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleDefinitionId: AzureWebsiteContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${devRgEsposterAe001.name}/providers/Microsoft.Web/sites/${devFuncEsposter001.name}`,
    },
    {
      parent: devLogicEsposterAe001,
      protect: true,
    },
  );
