import AzureStorageBlobDataContributorRoleDefinitionId from "#src/azure/constants/AzureStorageBlobDataContributorRoleDefinitionId";
import AzureSubscriptionId from "#src/azure/constants/AzureSubscriptionId";
import JimmyChenPrincipalId from "#src/azure/constants/JimmyChenPrincipalId";
import { prodRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodstesposter001 } from "#src/azure/resources/Microsoft.Storage/storageAccounts/prodstesposter001";
import { AzureContainer } from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const jimmyChenProdstesposter001PublicDungeonsAssetsStorageBlobDataContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "jimmy-chen-prodstesposter001-public-dungeons-assets-storage-blob-data-contributor",
    {
      principalId: JimmyChenPrincipalId,
      principalType: azure_native.authorization.PrincipalType.User,
      roleAssignmentName: "bcfa8e98-d4f7-4dac-a835-b302dcc076bf",
      roleDefinitionId: AzureStorageBlobDataContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${prodRgEsposterAe001.name}/providers/Microsoft.Storage/storageAccounts/${prodstesposter001.name}/blobServices/default/containers/${AzureContainer.PublicDungeonsAssets}`,
    },
    { parent: prodstesposter001, protect: true },
  );
