import type { WebhookPayload } from "@esposter/shared";

export interface WebhookQueueMessage {
  id: string;
  payload: WebhookPayload;
}
