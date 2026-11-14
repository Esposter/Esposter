import type { WebhookPayload } from "#src/models/message/webhook/WebhookPayload";
import type { WebhookInMessage } from "#src/schema/message/webhooksInMessage";

import { webhookPayloadSchema } from "#src/models/message/webhook/WebhookPayload";
import { queueMessageEnvelopeSchema } from "#src/models/queue/QueueMessageEnvelope";
import { selectWebhookInMessageSchema } from "#src/schema/message/webhooksInMessage";
import { z } from "zod";

// The message a webhook push sends: the payload the sender posted, and the webhook's room and author. The route checks
// the webhook and its token before it sends, so the job trusts what it reads here. Queues deliver at least once and a
// dead letter replays, so the push carries the id it was accepted under: every delivery of this body writes one message
export interface WebhookQueueMessage {
  deliveryId: string;
  payload: WebhookPayload;
  webhook: Pick<WebhookInMessage, "roomId" | "userId">;
}

export const webhookQueueMessageSchema = z.object({
  ...queueMessageEnvelopeSchema.shape,
  deliveryId: z.uuid(),
  payload: webhookPayloadSchema,
  webhook: selectWebhookInMessageSchema.pick({ roomId: true, userId: true }),
}) satisfies z.ZodType<WebhookQueueMessage>;
