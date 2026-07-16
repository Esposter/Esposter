import { devRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devSbnsEsposter001 } from "@/azure/resources/Microsoft.ServiceBus/namespaces/devSbnsEsposter001";
import { AzureQueue } from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";

export const devSbnsEsposter001ScheduledMessageJobs: azure_native.servicebus.Queue = new azure_native.servicebus.Queue(
  "dev-sbns-esposter-001/scheduled-message-jobs",
  {
    namespaceName: devSbnsEsposter001.name,
    queueName: AzureQueue.ScheduledMessageJobs,
    resourceGroupName: devRgEsposterAe001.name,
  },
  {
    parent: devSbnsEsposter001,
    protect: true,
  },
);
