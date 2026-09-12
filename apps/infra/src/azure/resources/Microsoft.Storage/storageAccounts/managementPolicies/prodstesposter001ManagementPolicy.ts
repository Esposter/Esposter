import { prodRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodstesposter001Deadletter } from "#src/azure/resources/Microsoft.Storage/storageAccounts/blobContainers/prodstesposter001Deadletter";
import { prodstesposter001 } from "#src/azure/resources/Microsoft.Storage/storageAccounts/prodstesposter001";
import { getStorageManagementPolicyRules } from "#src/azure/services/getStorageManagementPolicyRules";
import * as azure_native from "@pulumi/azure-native";

export const prodstesposter001ManagementPolicy: azure_native.storage.ManagementPolicy =
  new azure_native.storage.ManagementPolicy(
    "prodstesposter001/default-management-policy",
    {
      accountName: prodstesposter001.name,
      managementPolicyName: "default",
      policy: {
        rules: getStorageManagementPolicyRules(prodstesposter001Deadletter),
      },
      resourceGroupName: prodRgEsposterAe001.name,
    },
    {
      parent: prodstesposter001,
      protect: true,
    },
  );
