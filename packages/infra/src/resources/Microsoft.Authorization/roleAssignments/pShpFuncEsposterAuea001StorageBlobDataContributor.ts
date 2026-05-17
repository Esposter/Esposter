import AzureStorageBlobDataContributorRoleDefinitionId from "@/constants/AzureStorageBlobDataContributorRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import { pshpstespauea001 } from "@/resources/Microsoft.Storage/storageAccounts/pshpstespauea001";
import { pShpFuncEsposterAuea001 } from "@/resources/Microsoft.Web/sites/pShpFuncEsposterAuea001";
import { applyPrincipalId } from "@/services/applyPrincipalId";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const roleAssignmentName = "552a624f-7b08-43d6-a49e-8eeda4df30b9";

export const pShpFuncEsposterAuea001StorageBlobDataContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "p-shp-func-esposter-auea-001-storage-blob-data-contributor",
    {
      principalId: applyPrincipalId(pShpFuncEsposterAuea001.identity, pShpFuncEsposterAuea001.name),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName,
      roleDefinitionId: AzureStorageBlobDataContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${pShpRgEsposterAuea001.name}/providers/Microsoft.Storage/storageAccounts/${pshpstespauea001.name}`,
    },
    {
      protect: true,
    },
  );
