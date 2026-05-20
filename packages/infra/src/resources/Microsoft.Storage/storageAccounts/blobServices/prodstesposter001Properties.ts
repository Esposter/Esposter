import { prodRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodstesposter001 } from "@/resources/Microsoft.Storage/storageAccounts/prodstesposter001";
import * as azure_native from "@pulumi/azure-native";

export const prodstesposter001Properties: azure_native.storage.BlobServiceProperties =
  new azure_native.storage.BlobServiceProperties(
    "prodstesposter001/default",
    {
      accountName: prodstesposter001.name,
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
            allowedOrigins: ["https://esposter.com"],
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
      resourceGroupName: prodRgEsposterAe001.name,
    },
    {
      parent: prodstesposter001,
      protect: true,
    },
  );
