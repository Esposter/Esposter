import AzureStorageTableDataReaderRoleDefinitionId from "@/azure/constants/AzureStorageTableDataReaderRoleDefinitionId";
import AzureSubscriptionId from "@/azure/constants/AzureSubscriptionId";
import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodstesposter001 } from "@/azure/resources/Microsoft.Storage/storageAccounts/prodstesposter001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const prodSrchEsposter001StorageTableDataReader: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "prod-srch-esposter-001-storage-table-data-reader",
    {
      principalId: "410221f9-50a3-4c38-8826-b052d1f5457a",
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName: "58ca2e63-71c7-4697-89a4-5ff1457ff829",
      roleDefinitionId: AzureStorageTableDataReaderRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${prodRgEsposterAe001.name}/providers/Microsoft.Storage/storageAccounts/${prodstesposter001.name}`,
    },
    {
      parent: prodstesposter001,
      protect: true,
    },
  );
