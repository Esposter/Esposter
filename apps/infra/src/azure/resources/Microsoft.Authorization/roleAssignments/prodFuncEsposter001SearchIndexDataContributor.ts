import AzureSearchIndexDataContributorRoleDefinitionId from "#src/azure/constants/AzureSearchIndexDataContributorRoleDefinitionId";
import AzureSubscriptionId from "#src/azure/constants/AzureSubscriptionId";
import { prodRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodSrchEsposter001 } from "#src/azure/resources/Microsoft.Search/searchServices/prodSrchEsposter001";
import { prodFuncEsposter001 } from "#src/azure/resources/Microsoft.Web/sites/prodFuncEsposter001";
import { getPrincipalId } from "#src/azure/services/getPrincipalId";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const prodFuncEsposter001SearchIndexDataContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "prod-func-esposter-001-search-index-data-contributor",
    {
      principalId: getPrincipalId(prodFuncEsposter001),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName: "101e2d6d-eb69-4b62-b514-1fa61fe5c8aa",
      roleDefinitionId: AzureSearchIndexDataContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${prodRgEsposterAe001.name}/providers/Microsoft.Search/searchServices/${prodSrchEsposter001.name}`,
    },
    { parent: prodSrchEsposter001, protect: true },
  );
