import AzureStorageBlobDataContributorRoleDefinitionId from "@/azure/constants/AzureStorageBlobDataContributorRoleDefinitionId";
import AzureSubscriptionId from "@/azure/constants/AzureSubscriptionId";
import ProdFuncEsposter001PrincipalId from "@/azure/constants/ProdFuncEsposter001PrincipalId";
import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodstesposter001 } from "@/azure/resources/Microsoft.Storage/storageAccounts/prodstesposter001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const prodFuncEsposter001StorageBlobDataContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "prod-func-esposter-001-storage-blob-data-contributor",
    {
      principalId: ProdFuncEsposter001PrincipalId,
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName: "cd1d31fc-56f4-41c6-a53a-dce9fb7d1a1b",
      roleDefinitionId: AzureStorageBlobDataContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${prodRgEsposterAe001.name}/providers/Microsoft.Storage/storageAccounts/${prodstesposter001.name}`,
    },
    {
      parent: prodstesposter001,
      protect: true,
    },
  );
