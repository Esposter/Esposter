import type { ReviewThread } from "#src/models/coderabbit/shared/ReviewThread";

export interface DrainInput {
  // The `ai:coderabbit:feedback` output, so the body-only buckets reach Claude in the shape the skill teaches
  feedback: string;
  openThreads: ReviewThread[];
  pullRequest: number;
  // Present when the newest review's body-only findings are still open
  reviewId?: number;
}
