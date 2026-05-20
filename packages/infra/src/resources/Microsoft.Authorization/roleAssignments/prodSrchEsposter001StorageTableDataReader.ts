import AzureStorageTableDataReaderRoleDefinitionId from "@/constants/AzureStorageTableDataReaderRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { prodRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodSrchEsposter001 } from "@/resources/Microsoft.Search/searchServices/prodSrchEsposter001";
import { prodstesposter001 } from "@/resources/Microsoft.Storage/storageAccounts/prodstesposter001";
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
      parent: prodSrchEsposter001,
      protect: true,
    },
  );
