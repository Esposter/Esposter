import { prodRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodstesposter001 } from "@/resources/Microsoft.Storage/storageAccounts/prodstesposter001";
import { AzureContainer } from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";

export const prodstesposter001ManagementPolicy: azure_native.storage.ManagementPolicy =
  new azure_native.storage.ManagementPolicy(
    "prodstesposter001/default-management-policy",
    {
      accountName: prodstesposter001.name,
      managementPolicyName: "default",
      policy: {
        rules: [
          {
            definition: {
              actions: {
                version: {
                  delete: {
                    daysAfterCreationGreaterThan: 1,
                  },
                },
              },
              filters: {
                blobTypes: ["blockBlob", "appendBlob"],
              },
            },
            enabled: true,
            name: "DeletePreviousVersions (auto-created)",
            type: azure_native.storage.RuleType.Lifecycle,
          },
          {
            definition: {
              actions: {
                baseBlob: {
                  tierToCold: {
                    daysAfterCreationGreaterThan: 90,
                  },
                  tierToCool: {
                    daysAfterCreationGreaterThan: 30,
                  },
                },
              },
              filters: {
                blobTypes: ["blockBlob"],
                prefixMatch: [AzureContainer.MessageAssets],
              },
            },
            enabled: true,
            name: "TierMessageAttachments",
            type: azure_native.storage.RuleType.Lifecycle,
          },
        ],
      },
      resourceGroupName: prodRgEsposterAe001.name,
    },
    {
      parent: prodstesposter001,
      protect: true,
    },
  );
