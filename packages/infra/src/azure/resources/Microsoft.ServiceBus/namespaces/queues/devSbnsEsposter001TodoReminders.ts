import { devRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devSbnsEsposter001 } from "@/azure/resources/Microsoft.ServiceBus/namespaces/devSbnsEsposter001";
import { AzureQueue } from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";

export const devSbnsEsposter001TodoReminders: azure_native.servicebus.Queue = new azure_native.servicebus.Queue(
  "dev-sbns-esposter-001/todo-reminders",
  {
    // Deduplicates the deterministic (resource, item, dueAt) messageId so a due date toggled away and
    // Back across saves collapses to one reminder; P7D is the Azure maximum detection window
    duplicateDetectionHistoryTimeWindow: "P7D",
    namespaceName: devSbnsEsposter001.name,
    queueName: AzureQueue.TodoReminders,
    requiresDuplicateDetection: true,
    resourceGroupName: devRgEsposterAe001.name,
  },
  {
    parent: devSbnsEsposter001,
    protect: true,
  },
);
