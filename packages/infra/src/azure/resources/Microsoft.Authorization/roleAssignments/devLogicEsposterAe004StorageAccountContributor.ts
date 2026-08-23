import AzureStorageAccountContributorRoleDefinitionId from "#src/azure/constants/AzureStorageAccountContributorRoleDefinitionId";
import AzureSubscriptionId from "#src/azure/constants/AzureSubscriptionId";
import DevLogicEsposterAe004PrincipalId from "#src/azure/constants/DevLogicEsposterAe004PrincipalId";
import { devRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devstesposter001 } from "#src/azure/resources/Microsoft.Storage/storageAccounts/devstesposter001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

// The event subscriptions this workflow recreates dead-letter to the storage account, and Azure authorizes a
// Linked scope as well as the target: writing the subscription needs write on the account the dead-letter
// Container lives in. Without it the write is refused as `LinkedAuthorizationFailed` even though the identity
// Holds every permission the topic itself asks for, so the workflow can read a missing subscription but not heal it
export const devLogicEsposterAe004StorageAccountContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "dev-logic-esposter-ae-004-storage-account-contributor",
    {
      principalId: DevLogicEsposterAe004PrincipalId,
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleDefinitionId: AzureStorageAccountContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${devRgEsposterAe001.name}/providers/Microsoft.Storage/storageAccounts/${devstesposter001.name}`,
    },
    {
      parent: devstesposter001,
      protect: true,
    },
  );
