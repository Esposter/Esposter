import type { ReviewFile } from "#src/models/review/ReviewFile";

// One window of the run: its base and end, the commits it holds, and its batches. The run plans every window owed, so a
// Window's position in that plan is its index, the one the fix matrix names it by.
export interface ReviewWindow {
  base: string;
  batches: ReviewFile[][];
  commitShas: string[];
  end: string;
}
