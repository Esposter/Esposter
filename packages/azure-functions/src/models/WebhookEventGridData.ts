import type { Webhook, WebhookPayload } from "@esposter/db-schema";

export interface WebhookEventGridData {
  payload: WebhookPayload;
  webhook: Pick<Webhook, "roomId" | "userId">;
}
