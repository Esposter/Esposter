import AzureSubscriptionId from "#src/azure/constants/AzureSubscriptionId";
import AzureWebsiteContributorRoleDefinitionId from "#src/azure/constants/AzureWebsiteContributorRoleDefinitionId";
import { devLogicEsposterAe002 } from "#src/azure/resources/Microsoft.Logic/workflows/devLogicEsposterAe002";
import { devRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devFuncEsposter001 } from "#src/azure/resources/Microsoft.Web/sites/devFuncEsposter001";
import { getPrincipalId } from "#src/azure/services/getPrincipalId";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const devLogicEsposterAe002WebsiteContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "dev-logic-esposter-ae-002-website-contributor",
    {
      principalId: getPrincipalId(devLogicEsposterAe002),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleDefinitionId: AzureWebsiteContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${devRgEsposterAe001.name}/providers/Microsoft.Web/sites/${devFuncEsposter001.name}`,
    },
    {
      parent: devFuncEsposter001,
      protect: true,
    },
  );
