import AzureStorageBlobDataContributorRoleDefinitionId from "@/constants/AzureStorageBlobDataContributorRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import Dshpstespauea001Name from "@/constants/Dshpstespauea001Name";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const roleAssignmentName = "150a1bfa-b400-5558-985a-2623d85da5da";

export const dshpstespauea001ContainerBlobDataContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "dshpstespauea001-container-blob-data-contributor",
    {
      principalId: "80ccd4cc-f63a-4ddc-9363-b64bbfefbe3f",
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName,
      roleDefinitionId: AzureStorageBlobDataContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourcegroups/${dShpRgEsposterAuea001.name}/providers/Microsoft.Storage/storageAccounts/${Dshpstespauea001Name}/blobServices/default/containers/${Dshpstespauea001Name}`,
    },
    {
      import:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourcegroups/d-shp-rg-esposter-auea-001/providers/Microsoft.Storage/storageAccounts/dshpstespauea001/blobServices/default/containers/dshpstespauea001/providers/Microsoft.Authorization/roleAssignments/150a1bfa-b400-5558-985a-2623d85da5da",
      protect: true,
    },
  );
