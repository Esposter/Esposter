import AzureStorageTableDataContributorRoleDefinitionId from "@/constants/AzureStorageTableDataContributorRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import { pshpstespauea001 } from "@/resources/Microsoft.Storage/storageAccounts/pshpstespauea001";
import { pShpFuncEsposterAuea001 } from "@/resources/Microsoft.Web/sites/pShpFuncEsposterAuea001";
import { applyPrincipalId } from "@/services/applyPrincipalId";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const roleAssignmentName = "5f0c6147-5cf5-4590-8a43-64d01c22f613";

export const pShpFuncEsposterAuea001StorageTableDataContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "p-shp-func-esposter-auea-001-storage-table-data-contributor",
    {
      principalId: applyPrincipalId(pShpFuncEsposterAuea001.identity, pShpFuncEsposterAuea001.name),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName,
      roleDefinitionId: AzureStorageTableDataContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourcegroups/${pShpRgEsposterAuea001.name}/providers/Microsoft.Storage/storageAccounts/${pshpstespauea001.name}`,
    },
    {
      protect: true,
    },
  );
