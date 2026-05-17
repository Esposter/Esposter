import AzureStorageAccountContributorRoleDefinitionId from "@/constants/AzureStorageAccountContributorRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import { dshpstespauea001 } from "@/resources/Microsoft.Storage/storageAccounts/dshpstespauea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const roleAssignmentName = "16f27b36-56c3-48b8-a0a3-87648f1cd4cd";

export const deploymentPrincipalDshpstespauea001StorageAccountContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "deployment-principal-dshpstespauea001-storage-account-contributor",
    {
      principalId: "b456c265-3d0b-47f5-b728-dcfb87e5d554",
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName,
      roleDefinitionId: AzureStorageAccountContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${dShpRgEsposterAuea001.name}/providers/Microsoft.Storage/storageAccounts/${dshpstespauea001.name}`,
    },
    {
      import:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001/providers/Microsoft.Storage/storageAccounts/dshpstespauea001/providers/Microsoft.Authorization/roleAssignments/16f27b36-56c3-48b8-a0a3-87648f1cd4cd",
      protect: true,
    },
  );
