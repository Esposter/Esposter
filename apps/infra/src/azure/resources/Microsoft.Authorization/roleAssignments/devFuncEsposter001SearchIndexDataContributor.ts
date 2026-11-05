import AzureSearchIndexDataContributorRoleDefinitionId from "#src/azure/constants/AzureSearchIndexDataContributorRoleDefinitionId";
import AzureSubscriptionId from "#src/azure/constants/AzureSubscriptionId";
import { devRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devSrchEsposter001 } from "#src/azure/resources/Microsoft.Search/searchServices/devSrchEsposter001";
import { devFuncEsposter001 } from "#src/azure/resources/Microsoft.Web/sites/devFuncEsposter001";
import { getPrincipalId } from "#src/azure/services/getPrincipalId";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const devFuncEsposter001SearchIndexDataContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "dev-func-esposter-001-search-index-data-contributor",
    {
      principalId: getPrincipalId(devFuncEsposter001),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName: "ed4e0444-6627-44f2-96fe-f6963a89070d",
      roleDefinitionId: AzureSearchIndexDataContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${devRgEsposterAe001.name}/providers/Microsoft.Search/searchServices/${devSrchEsposter001.name}`,
    },
    { parent: devSrchEsposter001, protect: true },
  );
