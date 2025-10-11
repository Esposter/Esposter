import type { WebhookQueueMessage } from "@/models/WebhookQueueMessage";

import { WEBHOOK_STORAGE_QUEUE_OUTPUT } from "@/services/constants";
import { getTableClient } from "@/services/getTableClient";
import { getWebhookCreateMessageInput } from "@/services/getWebhookCreateMessageInput";
import { app } from "@azure/functions";
import { createMessage } from "@esposter/db";
import { AzureTable } from "@esposter/db-schema";

app.storageQueue("processWebhook", {
  connection: "AzureWebJobsStorage",
  handler: async (queueEntry, context) => {
    context.log("Queue trigger function processed message: ", queueEntry);
    const { payload, webhook } = queueEntry as WebhookQueueMessage;

    try {
      const messageClient = await getTableClient(AzureTable.Messages);
      const messageAscendingClient = await getTableClient(AzureTable.MessagesAscending);
      const webhookCreateMessageInput = getWebhookCreateMessageInput(payload, webhook);
      await createMessage(messageClient, messageAscendingClient, webhookCreateMessageInput);
    } catch (error) {
      context.error("Failed to process webhook queue message:", error);
      throw error;
    }
  },
  queueName: WEBHOOK_STORAGE_QUEUE_OUTPUT.queueName,
});

export default {};
