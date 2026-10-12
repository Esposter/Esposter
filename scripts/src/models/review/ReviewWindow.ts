import type { ReviewFile } from "#src/models/review/ReviewFile";

// The window one run reviews: its base and end, the commits it holds, how many owed commits lie past it, and its batches
export interface ReviewWindow {
  base: string;
  batches: ReviewFile[][];
  commitShas: string[];
  end: string;
  owedAfter: number;
}
