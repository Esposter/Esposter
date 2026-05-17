import * as azure_native from "@pulumi/azure-native";

export const pshpstespauea001DefaultManagementPolicy: azure_native.storage.ManagementPolicy =
  new azure_native.storage.ManagementPolicy(
    "pshpstespauea001/default-management-policy",
    {
      accountName: "pshpstespauea001",
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
        ],
      },
      resourceGroupName: "p-shp-rg-esposter-auea-001",
    },
    {
      protect: true,
    },
  );
