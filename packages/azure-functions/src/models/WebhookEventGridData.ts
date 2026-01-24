import type { WebhookInMessage, WebhookPayload } from "@esposter/db-schema";

export interface WebhookEventGridData {
  payload: WebhookPayload;
  webhook: Pick<WebhookInMessage, "roomId" | "userId">;
}
