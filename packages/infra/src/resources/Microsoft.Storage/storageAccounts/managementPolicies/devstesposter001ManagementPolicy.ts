import { devRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devstesposter001 } from "@/resources/Microsoft.Storage/storageAccounts/devstesposter001";
import { AzureContainer } from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";

export const devstesposter001ManagementPolicy: azure_native.storage.ManagementPolicy =
  new azure_native.storage.ManagementPolicy(
    "devstesposter001/default-management-policy",
    {
      accountName: devstesposter001.name,
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
      resourceGroupName: devRgEsposterAe001.name,
    },
    {
      parent: devstesposter001,
      protect: true,
    },
  );
