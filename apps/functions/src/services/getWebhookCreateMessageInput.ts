import type { WebhookCreateMessageInput, WebhookInMessage, WebhookPayload } from "@esposter/db-schema";

import { MessageType } from "@esposter/db-schema";

export const getWebhookCreateMessageInput = (
  payload: WebhookPayload,
  { roomId, userId }: Pick<WebhookInMessage, "roomId" | "userId">,
): WebhookCreateMessageInput => ({
  appUser: {
    id: userId,
    image: payload.avatar_url,
    name: payload.username,
  },
  message: payload.content,
  roomId,
  type: MessageType.Webhook,
});
