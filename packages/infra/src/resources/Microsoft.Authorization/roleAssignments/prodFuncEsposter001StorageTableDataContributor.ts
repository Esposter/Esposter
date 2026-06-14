import AzureStorageTableDataContributorRoleDefinitionId from "@/constants/AzureStorageTableDataContributorRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import ProdFuncEsposter001PrincipalId from "@/constants/ProdFuncEsposter001PrincipalId";
import { prodRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodstesposter001 } from "@/resources/Microsoft.Storage/storageAccounts/prodstesposter001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const prodFuncEsposter001StorageTableDataContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "prod-func-esposter-001-storage-table-data-contributor",
    {
      principalId: ProdFuncEsposter001PrincipalId,
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName: "bc13039d-2901-4b26-b750-4f5e4d3825da",
      roleDefinitionId: AzureStorageTableDataContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${prodRgEsposterAe001.name}/providers/Microsoft.Storage/storageAccounts/${prodstesposter001.name}`,
    },
    {
      parent: prodstesposter001,
      protect: true,
    },
  );
