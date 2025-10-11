import type { WebhookQueueMessage } from "@/models/WebhookQueueMessage";

import { WEBHOOK_STORAGE_QUEUE_OUTPUT } from "@/services/constants";
import { db } from "@/services/db";
import { getTableClient } from "@/services/getTableClient";
import { getWebhookCreateMessageInput } from "@/services/getWebhookCreateMessageInput";
import { app } from "@azure/functions";
import { createMessage } from "@esposter/db";
import { AzureTable, DatabaseEntityType } from "@esposter/db-schema";
import { NotFoundError } from "@esposter/shared";

app.storageQueue("processWebhook", {
  connection: "AzureWebJobsStorage",
  handler: async (queueEntry, context) => {
    context.log("Queue trigger function processed message: ", queueEntry);
    const {
      payload,
      webhook: { roomId, userId },
    } = queueEntry as WebhookQueueMessage;

    try {
      const messageClient = await getTableClient(AzureTable.Messages);
      const messageAscendingClient = await getTableClient(AzureTable.MessagesAscending);
      const appUser = await db.query.appUsers.findFirst({
        where: (appUsers, { eq }) => eq(appUsers.id, userId),
      });
      if (!appUser) {
        context.error(new NotFoundError(DatabaseEntityType.AppUser, userId));
        return;
      }

      const webhookCreateMessageInput = getWebhookCreateMessageInput(payload, roomId, appUser);
      await createMessage(messageClient, messageAscendingClient, webhookCreateMessageInput);
    } catch (error) {
      context.error("Failed to process webhook queue message:", error);
      throw error;
    }
  },
  queueName: WEBHOOK_STORAGE_QUEUE_OUTPUT.queueName,
});

export default {};
