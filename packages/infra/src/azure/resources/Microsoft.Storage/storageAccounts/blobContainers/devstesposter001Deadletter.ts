import { devRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devstesposter001 } from "@/azure/resources/Microsoft.Storage/storageAccounts/devstesposter001";
import * as azure_native from "@pulumi/azure-native";

const containerName = "deadletter";

export const devstesposter001Deadletter: azure_native.storage.BlobContainer = new azure_native.storage.BlobContainer(
  `devstesposter001/${containerName}`,
  {
    accountName: devstesposter001.name,
    containerName,
    publicAccess: azure_native.storage.PublicAccess.None,
    resourceGroupName: devRgEsposterAe001.name,
  },
  {
    parent: devstesposter001,
    protect: true,
  },
);
