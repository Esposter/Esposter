import AzureStorageTableDataContributorRoleDefinitionId from "@/constants/AzureStorageTableDataContributorRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import { pshpstespauea001 } from "@/resources/Microsoft.Storage/storageAccounts/pshpstespauea001";
import { pShpFuncEsposterAuea001 } from "@/resources/Microsoft.Web/sites/pShpFuncEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const roleAssignmentName = "5f0c6147-5cf5-4590-8a43-64d01c22f613";

export const pShpFuncEsposterAuea001StorageTableDataContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "p-shp-func-esposter-auea-001-storage-table-data-contributor",
    {
      principalId: pShpFuncEsposterAuea001.identity.apply((identity) => identity?.principalId ?? ""),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName,
      roleDefinitionId: AzureStorageTableDataContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourcegroups/${pShpRgEsposterAuea001.name}/providers/Microsoft.Storage/storageAccounts/${pshpstespauea001.name}`,
    },
    {
      import:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourcegroups/p-shp-rg-esposter-auea-001/providers/Microsoft.Storage/storageAccounts/pshpstespauea001/providers/Microsoft.Authorization/roleAssignments/5f0c6147-5cf5-4590-8a43-64d01c22f613",
      protect: true,
    },
  );
