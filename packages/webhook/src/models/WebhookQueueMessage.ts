import type { Webhook, WebhookPayload } from "@esposter/db";

export interface WebhookQueueMessage {
  payload: WebhookPayload;
  webhook: Pick<Webhook, "roomId" | "userId">;
}
