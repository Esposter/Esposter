import type { WebhookInMessage, WebhookPayload } from "@esposter/db-schema";

import { selectWebhookInMessageSchema, webhookPayloadSchema } from "@esposter/db-schema";
import { z } from "zod";

export interface WebhookEventGridData {
  payload: WebhookPayload;
  webhook: Pick<WebhookInMessage, "roomId" | "userId">;
}

export const webhookEventGridDataSchema = z.object({
  payload: webhookPayloadSchema,
  webhook: selectWebhookInMessageSchema.pick({ roomId: true, userId: true }),
}) satisfies z.ZodType<WebhookEventGridData>;
