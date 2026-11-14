import { getRoomObject } from "#src/services/room/getRoomObject";
import { webhookQueueMessageSchema } from "@esposter/db-schema";

// Not idempotent, so the queue does not redeliver it: a retry would write the message a second time. The room's object
// takes the write as the webhook's app user, named by the payload, and nothing else of the sender
export const processWebhookHandler = async (body: unknown): Promise<void> => {
  const { payload, webhook } = webhookQueueMessageSchema.parse(body);
  await getRoomObject(webhook.roomId).createWebhookMessage({
    appUserId: webhook.userId,
    message: payload.content,
    senderName: payload.username,
  });
};
