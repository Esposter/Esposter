import type { RateLimitInput } from "#src/models/coderabbit/collect/RateLimitInput";

export interface SkippedReviewInput extends RateLimitInput {
  // The pull request carries no CodeRabbit check at all, so an unreadable status is the free slot the ask is for
  // Rather than a review that may have just started
  isCheckMissing: boolean;
  nowMs: number;
}
