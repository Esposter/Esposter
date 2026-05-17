import AzureStorageTableDataReaderRoleDefinitionId from "@/constants/AzureStorageTableDataReaderRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import { pshpsrchespauea001 } from "@/resources/Microsoft.Search/searchServices/pshpsrchespauea001";
import { pshpstespauea001 } from "@/resources/Microsoft.Storage/storageAccounts/pshpstespauea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const roleAssignmentName = "c806bfb2-5cc8-4103-b53b-35f2e93ec854";

export const pshpsrchespauea001StorageTableDataReader: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "pshpsrchespauea001-storage-table-data-reader",
    {
      principalId: pshpsrchespauea001.identity.apply((identity) => identity?.principalId ?? ""),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName,
      roleDefinitionId: AzureStorageTableDataReaderRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${pShpRgEsposterAuea001.name}/providers/Microsoft.Storage/storageAccounts/${pshpstespauea001.name}`,
    },
    {
      protect: true,
    },
  );
