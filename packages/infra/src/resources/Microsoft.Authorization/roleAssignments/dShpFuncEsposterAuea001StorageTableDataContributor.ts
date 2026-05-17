import AzureStorageTableDataContributorRoleDefinitionId from "@/constants/AzureStorageTableDataContributorRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import { dshpstespauea001 } from "@/resources/Microsoft.Storage/storageAccounts/dshpstespauea001";
import { dShpFuncEsposterAuea001 } from "@/resources/Microsoft.Web/sites/dShpFuncEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const roleAssignmentName = "016c7d67-1507-4d59-b798-98ca32a3e5b9";

export const dShpFuncEsposterAuea001StorageTableDataContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "d-shp-func-esposter-auea-001-storage-table-data-contributor",
    {
      principalId: dShpFuncEsposterAuea001.identity.apply((identity) => identity?.principalId ?? ""),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName,
      roleDefinitionId: AzureStorageTableDataContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${dShpRgEsposterAuea001.name}/providers/Microsoft.Storage/storageAccounts/${dshpstespauea001.name}`,
    },
    {
      protect: true,
    },
  );
