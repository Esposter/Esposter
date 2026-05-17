import AzureStorageTableDataReaderRoleDefinitionId from "@/constants/AzureStorageTableDataReaderRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import { dshpsrchespauea001 } from "@/resources/Microsoft.Search/searchServices/dshpsrchespauea001";
import { dshpstespauea001 } from "@/resources/Microsoft.Storage/storageAccounts/dshpstespauea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const roleAssignmentName = "e2b63e64-c868-4d76-9c97-09cf5f442ad4";

export const dshpsrchespauea001StorageTableDataReader: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "dshpsrchespauea001-storage-table-data-reader",
    {
      principalId: dshpsrchespauea001.identity.apply((identity) => identity?.principalId ?? ""),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName,
      roleDefinitionId: AzureStorageTableDataReaderRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${dShpRgEsposterAuea001.name}/providers/Microsoft.Storage/storageAccounts/${dshpstespauea001.name}`,
    },
    {
      import:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001/providers/Microsoft.Storage/storageAccounts/dshpstespauea001/providers/Microsoft.Authorization/roleAssignments/e2b63e64-c868-4d76-9c97-09cf5f442ad4",
      protect: true,
    },
  );
