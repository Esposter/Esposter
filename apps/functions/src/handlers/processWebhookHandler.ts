import { getRoomObject } from "#src/services/room/getRoomObject";
import { webhookQueueMessageSchema } from "@esposter/db-schema";

// The room's object takes the write as the webhook's app user, named by the payload, and nothing else of the sender. A
// delivery can arrive more than once, so the object writes it under its delivery id and a redelivery writes nothing new
export const processWebhookHandler = async (body: unknown): Promise<void> => {
  const { deliveryId, payload, webhook } = webhookQueueMessageSchema.parse(body);
  await getRoomObject(webhook.roomId).createWebhookMessage({
    appUserId: webhook.userId,
    deliveryId,
    message: payload.content,
    senderName: payload.username,
  });
};
