import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import { pshpstespauea001 } from "@/resources/Microsoft.Storage/storageAccounts/pshpstespauea001";
import * as azure_native from "@pulumi/azure-native";

export const pshpstespauea001ManagementPolicy: azure_native.storage.ManagementPolicy =
  new azure_native.storage.ManagementPolicy(
    "pshpstespauea001/default-management-policy",
    {
      accountName: pshpstespauea001.name,
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
      resourceGroupName: pShpRgEsposterAuea001.name,
    },
    {
      protect: true,
    },
  );
