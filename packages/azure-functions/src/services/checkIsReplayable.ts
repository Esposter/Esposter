import { MAX_DEAD_LETTER_REPLAY_ATTEMPTS } from "#src/services/constants";
import { AzureFunctionIsIdempotentMap, azureFunctionSchema } from "@esposter/db-schema";

// Whether a dead-lettered event may go back on the topic, or belongs in quarantine for a human. Two ways to fail it:
// The per-event replay cap, and a handler that is not idempotent — republishing to one of those does not retry the
// Work, it duplicates it (a replayed ProcessWebhook writes a second message with a fresh rowKey). An eventType no
// AzureFunction claims is unroutable, so nothing would consume a republish of it either — which is also what
// Decides every dead letter raised by a system-topic subscription: those carry storage's own event type, and the
// Republish would go to the custom topic, where no subscription matches it (/docs/infra/eventgrid-dead-letter).
export const checkIsReplayable = (eventType: string, replayAttempts: number): boolean => {
  if (replayAttempts >= MAX_DEAD_LETTER_REPLAY_ATTEMPTS) return false;
  const { data, success } = azureFunctionSchema.safeParse(eventType);
  return success && AzureFunctionIsIdempotentMap[data];
};
