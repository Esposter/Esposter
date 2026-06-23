import AzureSubscriptionId from "@/azure/constants/AzureSubscriptionId";
import AzureWebsiteContributorRoleDefinitionId from "@/azure/constants/AzureWebsiteContributorRoleDefinitionId";
import DevLogicEsposterAe002PrincipalId from "@/azure/constants/DevLogicEsposterAe002PrincipalId";
import { devRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devFuncEsposter001 } from "@/azure/resources/Microsoft.Web/sites/devFuncEsposter001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const devLogicEsposterAe002WebsiteContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "dev-logic-esposter-ae-002-website-contributor",
    {
      principalId: DevLogicEsposterAe002PrincipalId,
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleDefinitionId: AzureWebsiteContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${devRgEsposterAe001.name}/providers/Microsoft.Web/sites/${devFuncEsposter001.name}`,
    },
    {
      parent: devFuncEsposter001,
      protect: true,
    },
  );
