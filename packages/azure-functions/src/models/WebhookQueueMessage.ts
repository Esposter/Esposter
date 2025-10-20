import type { Webhook, WebhookPayload } from "@esposter/db-schema";

export interface WebhookQueueMessage {
  payload: WebhookPayload;
  webhook: Pick<Webhook, "roomId" | "userId">;
}
