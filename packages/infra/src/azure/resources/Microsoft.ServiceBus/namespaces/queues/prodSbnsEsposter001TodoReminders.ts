import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodSbnsEsposter001 } from "@/azure/resources/Microsoft.ServiceBus/namespaces/prodSbnsEsposter001";
import { AzureQueue } from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";

export const prodSbnsEsposter001TodoReminders: azure_native.servicebus.Queue = new azure_native.servicebus.Queue(
  "prod-sbns-esposter-001/todo-reminders",
  {
    // Deduplicates the deterministic (resource, item, dueAt) messageId so a due date toggled away and
    // Back across saves collapses to one reminder; P7D is the Azure maximum detection window
    duplicateDetectionHistoryTimeWindow: "P7D",
    namespaceName: prodSbnsEsposter001.name,
    queueName: AzureQueue.TodoReminders,
    requiresDuplicateDetection: true,
    resourceGroupName: prodRgEsposterAe001.name,
  },
  {
    parent: prodSbnsEsposter001,
    protect: true,
  },
);
