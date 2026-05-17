import AzureStorageBlobDataContributorRoleDefinitionId from "@/constants/AzureStorageBlobDataContributorRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import { dshpstespauea001 } from "@/resources/Microsoft.Storage/storageAccounts/dshpstespauea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const roleAssignmentName = "655e4e1b-dd00-455c-9187-38e50b639a1a";

export const deploymentPrincipalDshpstespauea001StorageBlobDataContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "deployment-principal-dshpstespauea001-storage-blob-data-contributor",
    {
      principalId: "b456c265-3d0b-47f5-b728-dcfb87e5d554",
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName,
      roleDefinitionId: AzureStorageBlobDataContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${dShpRgEsposterAuea001.name}/providers/Microsoft.Storage/storageAccounts/${dshpstespauea001.name}`,
    },
    {
      protect: true,
    },
  );
