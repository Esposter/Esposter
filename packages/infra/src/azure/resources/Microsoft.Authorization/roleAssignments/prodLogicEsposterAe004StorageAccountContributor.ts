import AzureStorageAccountContributorRoleDefinitionId from "#src/azure/constants/AzureStorageAccountContributorRoleDefinitionId";
import AzureSubscriptionId from "#src/azure/constants/AzureSubscriptionId";
import ProdLogicEsposterAe004PrincipalId from "#src/azure/constants/ProdLogicEsposterAe004PrincipalId";
import { prodRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodstesposter001 } from "#src/azure/resources/Microsoft.Storage/storageAccounts/prodstesposter001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

// The event subscriptions this workflow recreates dead-letter to the storage account, and Azure authorizes a
// Linked scope as well as the target: writing the subscription needs write on the account the dead-letter
// Container lives in. Without it the write is refused as `LinkedAuthorizationFailed` even though the identity
// Holds every permission the topic itself asks for, so the workflow can read a missing subscription but not heal it
export const prodLogicEsposterAe004StorageAccountContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "prod-logic-esposter-ae-004-storage-account-contributor",
    {
      principalId: ProdLogicEsposterAe004PrincipalId,
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleDefinitionId: AzureStorageAccountContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${prodRgEsposterAe001.name}/providers/Microsoft.Storage/storageAccounts/${prodstesposter001.name}`,
    },
    {
      parent: prodstesposter001,
      protect: true,
    },
  );
