import { prodRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodSbnsEsposter001 } from "#src/azure/resources/Microsoft.ServiceBus/namespaces/prodSbnsEsposter001";
import { AzureQueue } from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";

const queueName = AzureQueue.TodoReminders;

export const prodSbnsEsposter001TodoReminders: azure_native.servicebus.Queue = new azure_native.servicebus.Queue(
  `prod-sbns-esposter-001/${queueName}`,
  {
    namespaceName: prodSbnsEsposter001.name,
    queueName,
    resourceGroupName: prodRgEsposterAe001.name,
  },
  {
    parent: prodSbnsEsposter001,
    protect: true,
  },
);
