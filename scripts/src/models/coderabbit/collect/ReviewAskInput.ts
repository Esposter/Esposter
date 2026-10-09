import type { RateLimitInput } from "#src/models/coderabbit/collect/RateLimitInput";

export interface ReviewAskInput extends RateLimitInput {
  // Whether the ask is still owed on a fresh read of the check, taken only once no wait holds it: a review that started
  // Under the run would be cancelled by the ask
  checkIsAskOwed: () => boolean;
  // The review asked for, as each reason names it
  review: string;
}
