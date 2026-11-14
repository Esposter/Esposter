import { queueMessageEnvelopeSchema } from "#src/models/queue/QueueMessageEnvelope";
import { z } from "zod";

// The one message an account deletion sends. It names the account and nothing else: the sweep is keyed by that user
// Id, and reads what the account owns from the stores keyed to it.
export interface DeleteAccountQueueMessage {
  userId: string;
}

export const deleteAccountQueueMessageSchema = z.object({
  ...queueMessageEnvelopeSchema.shape,
  userId: z.string(),
}) satisfies z.ZodType<DeleteAccountQueueMessage>;
