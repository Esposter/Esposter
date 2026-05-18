import AzureStorageAccountContributorRoleDefinitionId from "@/constants/AzureStorageAccountContributorRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import DeploymentPrincipalId from "@/constants/DeploymentPrincipalId";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import { dshpstespauea001 } from "@/resources/Microsoft.Storage/storageAccounts/dshpstespauea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const roleAssignmentName = "16f27b36-56c3-48b8-a0a3-87648f1cd4cd";

export const deploymentPrincipalDshpstespauea001StorageAccountContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "deployment-principal-dshpstespauea001-storage-account-contributor",
    {
      principalId: DeploymentPrincipalId,
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName,
      roleDefinitionId: AzureStorageAccountContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${dShpRgEsposterAuea001.name}/providers/Microsoft.Storage/storageAccounts/${dshpstespauea001.name}`,
    },
    {
      protect: true,
    },
  );
