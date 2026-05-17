import AzureStorageBlobDataContributorRoleDefinitionId from "@/constants/AzureStorageBlobDataContributorRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import { dshpstespauea001 } from "@/resources/Microsoft.Storage/storageAccounts/dshpstespauea001";
import { dShpFuncEsposterAuea001 } from "@/resources/Microsoft.Web/sites/dShpFuncEsposterAuea001";
import { applyPrincipalId } from "@/services/applyPrincipalId";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const roleAssignmentName = "6114b971-ecd9-4261-8774-f642c5357ff7";

export const dShpFuncEsposterAuea001StorageBlobDataContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "d-shp-func-esposter-auea-001-storage-blob-data-contributor",
    {
      principalId: applyPrincipalId(dShpFuncEsposterAuea001.identity, dShpFuncEsposterAuea001.name),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName,
      roleDefinitionId: AzureStorageBlobDataContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${dShpRgEsposterAuea001.name}/providers/Microsoft.Storage/storageAccounts/${dshpstespauea001.name}`,
    },
    {
      protect: true,
    },
  );
