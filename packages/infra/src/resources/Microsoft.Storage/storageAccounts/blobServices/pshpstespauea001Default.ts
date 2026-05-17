import * as azure_native from "@pulumi/azure-native";

export const pshpstespauea001Default: azure_native.storage.BlobServiceProperties =
  new azure_native.storage.BlobServiceProperties(
    "pshpstespauea001/default",
    {
      accountName: "pshpstespauea001",
      blobServicesName: "default",
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
      resourceGroupName: "p-shp-rg-esposter-auea-001",
    },
    {
      protect: true,
    },
  );
