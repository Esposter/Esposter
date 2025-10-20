import type { WebhookQueueMessage } from "@/models/WebhookQueueMessage";
import type { PushNotificationQueueMessage } from "@esposter/db-schema";

import { PUSH_NOTIFICATION_STORAGE_QUEUE_OUTPUT, WEBHOOK_STORAGE_QUEUE_OUTPUT } from "@/services/constants";
import { getTableClient } from "@/services/getTableClient";
import { getWebhookCreateMessageInput } from "@/services/getWebhookCreateMessageInput";
import { getWebPubSubServiceClient } from "@/services/getWebPubSubServiceClient";
import { app } from "@azure/functions";
import { createMessage } from "@esposter/db";
import { AzureTable, AzureWebPubSubHub } from "@esposter/db-schema";

const name = "processWebhook";

app.storageQueue(name, {
  connection: "AzureWebJobsStorage",
  extraOutputs: [PUSH_NOTIFICATION_STORAGE_QUEUE_OUTPUT],
  handler: async (queueEntry, context) => {
    context.log(`${name} processed message: `, queueEntry);
    const { payload, webhook } = queueEntry as WebhookQueueMessage;

    try {
      const messageClient = await getTableClient(AzureTable.Messages);
      const messageAscendingClient = await getTableClient(AzureTable.MessagesAscending);
      const webhookCreateMessageInput = getWebhookCreateMessageInput(payload, webhook);
      const newMessage = await createMessage(messageClient, messageAscendingClient, webhookCreateMessageInput);
      const webPubSubServiceClient = getWebPubSubServiceClient(AzureWebPubSubHub.Messages);
      await webPubSubServiceClient.group(newMessage.partitionKey).sendToAll(newMessage);

      const pushNotificationQueueMessage: PushNotificationQueueMessage = {
        message: {
          message: newMessage.message,
          partitionKey: newMessage.partitionKey,
          rowKey: newMessage.rowKey,
          userId: newMessage.userId,
        },
        notificationOptions: { icon: newMessage.appUser.image, title: newMessage.appUser.name },
      };
      context.extraOutputs.set(PUSH_NOTIFICATION_STORAGE_QUEUE_OUTPUT.name, pushNotificationQueueMessage);
      context.log(
        `Queued ${PUSH_NOTIFICATION_STORAGE_QUEUE_OUTPUT.queueName} for message id: ${JSON.stringify({ partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey })}`,
      );
    } catch (error) {
      context.error(`${name} failed: `, error);
      throw error;
    }
  },
  queueName: WEBHOOK_STORAGE_QUEUE_OUTPUT.queueName,
});

export default {};
