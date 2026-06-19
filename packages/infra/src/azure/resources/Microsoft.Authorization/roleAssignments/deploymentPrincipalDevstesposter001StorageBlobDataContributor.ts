import AzureStorageBlobDataContributorRoleDefinitionId from "@/azure/constants/AzureStorageBlobDataContributorRoleDefinitionId";
import AzureSubscriptionId from "@/azure/constants/AzureSubscriptionId";
import DeploymentPrincipalId from "@/azure/constants/DeploymentPrincipalId";
import { devRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devstesposter001 } from "@/azure/resources/Microsoft.Storage/storageAccounts/devstesposter001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const deploymentPrincipalDevstesposter001StorageBlobDataContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "deployment-principal-devstesposter001-storage-blob-data-contributor",
    {
      principalId: DeploymentPrincipalId,
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName: "e1a94e43-c8da-405f-b933-b967ea261108",
      roleDefinitionId: AzureStorageBlobDataContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${devRgEsposterAe001.name}/providers/Microsoft.Storage/storageAccounts/${devstesposter001.name}`,
    },
    {
      parent: devstesposter001,
      protect: true,
    },
  );
