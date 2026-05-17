import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import { pshpstespauea001 } from "@/resources/Microsoft.Storage/storageAccounts/pshpstespauea001";
import * as azure_native from "@pulumi/azure-native";

export const pshpstespauea001Properties: azure_native.storage.BlobServiceProperties =
  new azure_native.storage.BlobServiceProperties(
    "pshpstespauea001/default",
    {
      accountName: pshpstespauea001.name,
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
      resourceGroupName: pShpRgEsposterAuea001.name,
    },
    {
      protect: true,
    },
  );
