import type { CreateMessageInput, WebhookPayload } from "@esposter/db";

export const mapWebhookPayloadToMessage = (payload: WebhookPayload, roomId: string): CreateMessageInput => ({
  files: [],
  message: payload.content ?? "",
  roomId,
});
