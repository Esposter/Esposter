import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import { dshpstespauea001 } from "@/resources/Microsoft.Storage/storageAccounts/dshpstespauea001";
import * as azure_native from "@pulumi/azure-native";

export const dshpstespauea001Properties: azure_native.storage.BlobServiceProperties =
  new azure_native.storage.BlobServiceProperties(
    "dshpstespauea001/default",
    {
      accountName: dshpstespauea001.name,
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
      resourceGroupName: dShpRgEsposterAuea001.name,
      restorePolicy: {
        enabled: false,
      },
    },
    {
      protect: true,
    },
  );
