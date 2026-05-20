import AzureStorageTableDataReaderRoleDefinitionId from "@/constants/AzureStorageTableDataReaderRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { devRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devstesposter001 } from "@/resources/Microsoft.Storage/storageAccounts/devstesposter001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const devSrchEsposter001StorageTableDataReader: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "dev-srch-esposter-001-storage-table-data-reader",
    {
      principalId: "89ef430d-d706-49e4-8df4-c3d656e7ce03",
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName: "11f9c094-b8bf-498d-a480-7463a97bf480",
      roleDefinitionId: AzureStorageTableDataReaderRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${devRgEsposterAe001.name}/providers/Microsoft.Storage/storageAccounts/${devstesposter001.name}`,
    },
    {
      parent: devstesposter001,
      protect: true,
    },
  );
