import AzureStorageQueueDataContributorRoleDefinitionId from "#src/azure/constants/AzureStorageQueueDataContributorRoleDefinitionId";
import AzureSubscriptionId from "#src/azure/constants/AzureSubscriptionId";
import { prodRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodstesposter001 } from "#src/azure/resources/Microsoft.Storage/storageAccounts/prodstesposter001";
import { prodFuncEsposter001 } from "#src/azure/resources/Microsoft.Web/sites/prodFuncEsposter001";
import { getPrincipalId } from "#src/azure/services/getPrincipalId";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const prodFuncEsposter001StorageQueueDataContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "prod-func-esposter-001-storage-queue-data-contributor",
    {
      principalId: getPrincipalId(prodFuncEsposter001),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName: "487bdc27-e6be-4475-ab5e-e64698ccccff",
      roleDefinitionId: AzureStorageQueueDataContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${prodRgEsposterAe001.name}/providers/Microsoft.Storage/storageAccounts/${prodstesposter001.name}`,
    },
    {
      parent: prodstesposter001,
      protect: true,
    },
  );
