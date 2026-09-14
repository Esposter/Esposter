import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";
import type { ReviewThread } from "#src/models/coderabbit/shared/ReviewThread";

// What the cycle hands the drain step: the open set it computed, and the reads the step's report and markers
// Come from, so the step fetches nothing the cycle already holds
export interface DrainStepInput {
  developSha: string;
  isDryRun: boolean;
  issueComments: GitHubEntry[];
  // The newest review that carries a body; without one there is nothing to drain
  newestReview?: GitHubReview;
  // Present when the newest review's body-only findings are still open
  openBodyReviewId?: number;
  openThreads: ReviewThread[];
  pullRequest: number;
  reviewFixesSha?: string;
  // Every unresolved thread, open or answered — the report reconciles the stated counts against them
  threads: ReviewThread[];
  viewerLogin: string;
}
