import { devRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devstesposter001 } from "@/resources/Microsoft.Storage/storageAccounts/devstesposter001";
import * as azure_native from "@pulumi/azure-native";
import { AzureQueue } from "@esposter/db-schema";

export const devstesposter001ScheduledMessageJobs: azure_native.storage.Queue = new azure_native.storage.Queue(
  "devstesposter001/default/scheduled-message-jobs",
  {
    accountName: devstesposter001.name,
    queueName: AzureQueue.ScheduledMessageJobs,
    resourceGroupName: devRgEsposterAe001.name,
  },
  {
    parent: devstesposter001,
    protect: true,
  },
);
