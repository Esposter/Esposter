import type { AppUser, WebhookCreateMessageInput, WebhookPayload } from "@esposter/db-schema";

import { MessageType } from "@esposter/db-schema";

export const getWebhookCreateMessageInput = (
  payload: WebhookPayload,
  roomId: string,
  appUser: AppUser,
): WebhookCreateMessageInput => ({
  appUser,
  files: [],
  message: payload.content ?? "",
  roomId,
  type: MessageType.Webhook,
});
