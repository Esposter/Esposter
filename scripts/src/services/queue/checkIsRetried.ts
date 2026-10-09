import { QueuePushOutcome } from "#src/models/queue/QueuePushOutcome";
import { MAX_PUSH_ATTEMPTS } from "#src/services/queue/constants";

// Whether a push is made again: only a refusal as stale, and only while attempts remain. `attempts` counts the pushes
// Already made, so the one that has just been refused is the last when it reaches the cap
export const checkIsRetried = (outcome: QueuePushOutcome, attempts: number): boolean =>
  outcome === QueuePushOutcome.Refused && attempts < MAX_PUSH_ATTEMPTS;
