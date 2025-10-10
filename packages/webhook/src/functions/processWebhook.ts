import type { WebhookQueueMessage } from "@/models/WebhookQueueMessage";

import { WEBHOOK_STORAGE_QUEUE_OUTPUT } from "@/services/constants";
import { getTableClient } from "@/services/getTableClient";
import { mapWebhookPayloadToMessage } from "@/services/mapWebhookPayloadToMessage";
import { app } from "@azure/functions";
import { AzureTable, createEntity, createMessageEntity, getReverseTickedTimestamp } from "@esposter/db";

app.storageQueue("processWebhook", {
  connection: "AzureWebJobsStorage",
  handler: async (queueEntry, context) => {
    context.log("Queue trigger function processed message: ", queueEntry);
    const {
      payload,
      webhook: { roomId, userId },
    } = queueEntry as WebhookQueueMessage;

    try {
      const messageInput = mapWebhookPayloadToMessage(payload, roomId);
      const messageEntity = createMessageEntity({ ...messageInput, userId });
      const messageClient = await getTableClient(AzureTable.Messages);
      await createEntity(messageClient, messageEntity);

      const messageAscendingClient = await getTableClient(AzureTable.MessagesAscending);
      await createEntity(messageAscendingClient, {
        partitionKey: messageEntity.partitionKey,
        rowKey: getReverseTickedTimestamp(messageEntity.rowKey),
      });
    } catch (error) {
      context.error("Failed to process webhook queue message:", error);
      throw error;
    }
  },
  queueName: WEBHOOK_STORAGE_QUEUE_OUTPUT.queueName,
});

export default {};
