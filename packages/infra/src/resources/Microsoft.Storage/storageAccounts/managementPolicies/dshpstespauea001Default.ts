import * as azure_native from "@pulumi/azure-native";

export const dshpstespauea001DefaultManagementPolicy: azure_native.storage.ManagementPolicy =
  new azure_native.storage.ManagementPolicy(
    "dshpstespauea001/default-management-policy",
    {
      accountName: "dshpstespauea001",
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
      resourceGroupName: "d-shp-rg-esposter-auea-001",
    },
    {
      protect: true,
    },
  );
