import { AzureContainer } from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";

export const getStorageManagementPolicyRules = (
  deadLetterContainer: azure_native.storage.BlobContainer,
): azure_native.types.input.storage.ManagementPolicyRuleArgs[] => [
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
  {
    definition: {
      actions: {
        baseBlob: {
          delete: {
            daysAfterCreationGreaterThan: 30,
          },
        },
      },
      filters: {
        blobTypes: ["blockBlob"],
        prefixMatch: [deadLetterContainer.name],
      },
    },
    enabled: true,
    name: "DeleteDeadLetter",
    type: azure_native.storage.RuleType.Lifecycle,
  },
];
