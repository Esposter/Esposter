import type { ReviewMode } from "#src/models/review/ReviewMode";

// The commits a review reads: those after `from` up to `to`, both resolved to full shas (or refs in steady mode)
export interface ReviewRange {
  from: string;
  mode: ReviewMode;
  to: string;
}
