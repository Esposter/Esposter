import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";

export interface ReleaseState {
  // The last sha a stated range ends at, or the merge base when none does: every count is measured from here
  frontier: string;
  issueComments: GitHubEntry[];
  // Absent before the first review, where the merge base stands in
  lastReviewedSha?: string;
  reviews: GitHubReview[];
}
