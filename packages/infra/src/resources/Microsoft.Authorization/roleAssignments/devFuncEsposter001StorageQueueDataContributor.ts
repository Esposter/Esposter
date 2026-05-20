import AzureStorageQueueDataContributorRoleDefinitionId from "@/constants/AzureStorageQueueDataContributorRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import DevFuncEsposter001PrincipalId from "@/constants/DevFuncEsposter001PrincipalId";
import { devRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devstesposter001 } from "@/resources/Microsoft.Storage/storageAccounts/devstesposter001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const devFuncEsposter001StorageQueueDataContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "dev-func-esposter-001-storage-queue-data-contributor",
    {
      principalId: DevFuncEsposter001PrincipalId,
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName: "61366a3f-c339-41cf-8c84-398e01603cee",
      roleDefinitionId: AzureStorageQueueDataContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${devRgEsposterAe001.name}/providers/Microsoft.Storage/storageAccounts/${devstesposter001.name}`,
    },
    {
      parent: devstesposter001,
      protect: true,
    },
  );
