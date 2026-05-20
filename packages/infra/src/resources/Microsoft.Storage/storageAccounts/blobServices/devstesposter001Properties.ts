import { devRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devstesposter001 } from "@/resources/Microsoft.Storage/storageAccounts/devstesposter001";
import * as azure_native from "@pulumi/azure-native";

export const devstesposter001Properties: azure_native.storage.BlobServiceProperties =
  new azure_native.storage.BlobServiceProperties(
    "devstesposter001/default",
    {
      accountName: devstesposter001.name,
      blobServicesName: "default",
      changeFeed: {
        enabled: false,
      },
      containerDeleteRetentionPolicy: {
        days: 7,
        enabled: true,
      },
      cors: {
        corsRules: [
          {
            allowedHeaders: ["*"],
            allowedMethods: ["PUT"],
            allowedOrigins: ["http://localhost:3000"],
            exposedHeaders: [""],
            maxAgeInSeconds: 86400,
          },
        ],
      },
      deleteRetentionPolicy: {
        allowPermanentDelete: false,
        days: 7,
        enabled: true,
      },
      isVersioningEnabled: false,
      resourceGroupName: devRgEsposterAe001.name,
      restorePolicy: {
        enabled: false,
      },
    },
    {
      parent: devstesposter001,
      protect: true,
    },
  );
