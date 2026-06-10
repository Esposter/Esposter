import { prodRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodstesposter001 } from "@/resources/Microsoft.Storage/storageAccounts/prodstesposter001";
import * as azure_native from "@pulumi/azure-native";
import { AzureQueue } from "@esposter/db-schema";

export const prodstesposter001ScheduledMessageJobs: azure_native.storage.Queue = new azure_native.storage.Queue(
  "prodstesposter001/default/scheduled-message-jobs",
  {
    accountName: prodstesposter001.name,
    queueName: AzureQueue.ScheduledMessageJobs,
    resourceGroupName: prodRgEsposterAe001.name,
  },
  {
    parent: prodstesposter001,
    protect: true,
  },
);
