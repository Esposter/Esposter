import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodstesposter001 } from "@/azure/resources/Microsoft.Storage/storageAccounts/prodstesposter001";
import * as azure_native from "@pulumi/azure-native";

const containerName = "deadletter";

export const prodstesposter001Deadletter: azure_native.storage.BlobContainer = new azure_native.storage.BlobContainer(
  `prodstesposter001/${containerName}`,
  {
    accountName: prodstesposter001.name,
    containerName,
    publicAccess: azure_native.storage.PublicAccess.None,
    resourceGroupName: prodRgEsposterAe001.name,
  },
  {
    parent: prodstesposter001,
    protect: true,
  },
);
