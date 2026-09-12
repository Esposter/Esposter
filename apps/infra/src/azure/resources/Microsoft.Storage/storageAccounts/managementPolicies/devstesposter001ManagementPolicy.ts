import { devRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devstesposter001Deadletter } from "#src/azure/resources/Microsoft.Storage/storageAccounts/blobContainers/devstesposter001Deadletter";
import { devstesposter001 } from "#src/azure/resources/Microsoft.Storage/storageAccounts/devstesposter001";
import { getStorageManagementPolicyRules } from "#src/azure/services/getStorageManagementPolicyRules";
import * as azure_native from "@pulumi/azure-native";

export const devstesposter001ManagementPolicy: azure_native.storage.ManagementPolicy =
  new azure_native.storage.ManagementPolicy(
    "devstesposter001/default-management-policy",
    {
      accountName: devstesposter001.name,
      managementPolicyName: "default",
      policy: {
        rules: getStorageManagementPolicyRules(devstesposter001Deadletter),
      },
      resourceGroupName: devRgEsposterAe001.name,
    },
    {
      parent: devstesposter001,
      protect: true,
    },
  );
