import AzureStorageTableDataReaderRoleDefinitionId from "#src/azure/constants/AzureStorageTableDataReaderRoleDefinitionId";
import AzureSubscriptionId from "#src/azure/constants/AzureSubscriptionId";
import { devRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devSrchEsposter001 } from "#src/azure/resources/Microsoft.Search/searchServices/devSrchEsposter001";
import { devstesposter001 } from "#src/azure/resources/Microsoft.Storage/storageAccounts/devstesposter001";
import { getPrincipalId } from "#src/azure/services/getPrincipalId";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const devSrchEsposter001StorageTableDataReader: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "dev-srch-esposter-001-storage-table-data-reader",
    {
      principalId: getPrincipalId(devSrchEsposter001),
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
