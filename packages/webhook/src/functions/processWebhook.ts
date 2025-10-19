import type { WebhookQueueMessage } from "@/models/WebhookQueueMessage";

import { WEBHOOK_STORAGE_QUEUE_OUTPUT } from "@/services/constants";
import { getTableClient } from "@/services/getTableClient";
import { getWebhookCreateMessageInput } from "@/services/getWebhookCreateMessageInput";
import { getWebPubSubServiceClient } from "@/services/getWebPubSubServiceClient";
import { pushNotification } from "@/services/pushNotification";
import { app } from "@azure/functions";
import { createMessage } from "@esposter/db";
import { AzureTable, AzureWebPubSubHub } from "@esposter/db-schema";
import webpush from "web-push";

webpush.setVapidDetails(process.env.BASE_URL, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

app.storageQueue("processWebhook", {
  connection: "AzureWebJobsStorage",
  handler: async (queueEntry, context) => {
    context.log("Queue trigger function processed message: ", queueEntry);
    const { payload, webhook } = queueEntry as WebhookQueueMessage;

    try {
      const messageClient = await getTableClient(AzureTable.Messages);
      const messageAscendingClient = await getTableClient(AzureTable.MessagesAscending);
      const webhookCreateMessageInput = getWebhookCreateMessageInput(payload, webhook);
      const newMessage = await createMessage(messageClient, messageAscendingClient, webhookCreateMessageInput);
      const webPubSubServiceClient = getWebPubSubServiceClient(AzureWebPubSubHub.Messages);
      await Promise.all([
        webPubSubServiceClient.group(newMessage.partitionKey).sendToAll(newMessage),
        pushNotification(newMessage),
      ]);
    } catch (error) {
      context.error("Failed to process webhook queue message:", error);
      throw error;
    }
  },
  queueName: WEBHOOK_STORAGE_QUEUE_OUTPUT.queueName,
});

export default {};
