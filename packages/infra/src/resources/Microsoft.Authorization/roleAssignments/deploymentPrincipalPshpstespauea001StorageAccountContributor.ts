import AzureStorageAccountContributorRoleDefinitionId from "@/constants/AzureStorageAccountContributorRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import { pshpstespauea001 } from "@/resources/Microsoft.Storage/storageAccounts/pshpstespauea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const roleAssignmentName = "588f291b-12d5-42da-aa64-44158da75d77";

export const deploymentPrincipalPshpstespauea001StorageAccountContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "deployment-principal-pshpstespauea001-storage-account-contributor",
    {
      principalId: "b456c265-3d0b-47f5-b728-dcfb87e5d554",
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName,
      roleDefinitionId: AzureStorageAccountContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourcegroups/${pShpRgEsposterAuea001.name}/providers/Microsoft.Storage/storageAccounts/${pshpstespauea001.name}`,
    },
    {
      import:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourcegroups/p-shp-rg-esposter-auea-001/providers/Microsoft.Storage/storageAccounts/pshpstespauea001/providers/Microsoft.Authorization/roleAssignments/588f291b-12d5-42da-aa64-44158da75d77",
      protect: true,
    },
  );
