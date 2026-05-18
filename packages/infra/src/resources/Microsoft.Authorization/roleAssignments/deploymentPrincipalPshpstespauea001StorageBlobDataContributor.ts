import AzureStorageBlobDataContributorRoleDefinitionId from "@/constants/AzureStorageBlobDataContributorRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import DeploymentPrincipalId from "@/constants/DeploymentPrincipalId";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import { pshpstespauea001 } from "@/resources/Microsoft.Storage/storageAccounts/pshpstespauea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const roleAssignmentName = "da37f989-6ed2-4860-8816-73aa7ddfae92";

export const deploymentPrincipalPshpstespauea001StorageBlobDataContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "deployment-principal-pshpstespauea001-storage-blob-data-contributor",
    {
      principalId: DeploymentPrincipalId,
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName,
      roleDefinitionId: AzureStorageBlobDataContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourcegroups/${pShpRgEsposterAuea001.name}/providers/Microsoft.Storage/storageAccounts/${pshpstespauea001.name}`,
    },
    {
      protect: true,
    },
  );
