import type { WebhookInMessage, WebhookPayload } from "@esposter/db-schema";

import { selectWebhookInMessageSchema, webhookPayloadSchema } from "@esposter/db-schema";
import { z } from "zod";

export interface WebhookEventGridData {
  payload: WebhookPayload;
  webhook: Pick<WebhookInMessage, "roomId" | "userId">;
}

const webhookSchema = selectWebhookInMessageSchema.pick({ roomId: true, userId: true });

export const webhookEventGridDataSchema: z.ZodObject<{
  payload: typeof webhookPayloadSchema;
  webhook: typeof webhookSchema;
}> = z.object({
  payload: webhookPayloadSchema,
  webhook: webhookSchema,
}) satisfies z.ZodType<WebhookEventGridData>;
