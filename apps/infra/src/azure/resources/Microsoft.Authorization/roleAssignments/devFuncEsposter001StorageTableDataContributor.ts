import AzureStorageTableDataContributorRoleDefinitionId from "#src/azure/constants/AzureStorageTableDataContributorRoleDefinitionId";
import AzureSubscriptionId from "#src/azure/constants/AzureSubscriptionId";
import { devRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devstesposter001 } from "#src/azure/resources/Microsoft.Storage/storageAccounts/devstesposter001";
import { devFuncEsposter001 } from "#src/azure/resources/Microsoft.Web/sites/devFuncEsposter001";
import { getPrincipalId } from "#src/azure/services/getPrincipalId";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const devFuncEsposter001StorageTableDataContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "dev-func-esposter-001-storage-table-data-contributor",
    {
      principalId: getPrincipalId(devFuncEsposter001),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName: "07998700-ff31-48a6-b4c8-6ad0dcc331ec",
      roleDefinitionId: AzureStorageTableDataContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${devRgEsposterAe001.name}/providers/Microsoft.Storage/storageAccounts/${devstesposter001.name}`,
    },
    {
      parent: devstesposter001,
      protect: true,
    },
  );
