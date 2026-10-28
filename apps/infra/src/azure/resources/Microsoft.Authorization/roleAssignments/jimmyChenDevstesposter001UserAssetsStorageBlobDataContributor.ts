import AzureStorageBlobDataContributorRoleDefinitionId from "#src/azure/constants/AzureStorageBlobDataContributorRoleDefinitionId";
import AzureSubscriptionId from "#src/azure/constants/AzureSubscriptionId";
import JimmyChenPrincipalId from "#src/azure/constants/JimmyChenPrincipalId";
import { devRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devstesposter001 } from "#src/azure/resources/Microsoft.Storage/storageAccounts/devstesposter001";
import { AzureContainer } from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const jimmyChenDevstesposter001UserAssetsStorageBlobDataContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "jimmy-chen-devstesposter001-user-assets-storage-blob-data-contributor",
    {
      principalId: JimmyChenPrincipalId,
      principalType: azure_native.authorization.PrincipalType.User,
      roleAssignmentName: "c9bf1d1c-b570-4605-9fc6-e0ea7657a6c6",
      roleDefinitionId: AzureStorageBlobDataContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${devRgEsposterAe001.name}/providers/Microsoft.Storage/storageAccounts/${devstesposter001.name}/blobServices/default/containers/${AzureContainer.UserAssets}`,
    },
    { parent: devstesposter001, protect: true },
  );
