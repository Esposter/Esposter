import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";
import type { ReviewThread } from "#src/models/coderabbit/shared/ReviewThread";

// The three reads the report is written from, taken once by whoever already holds them — the CLI reads them for
// The report alone, the collector has them in hand from its own gates
export interface FeedbackReportInput {
  // Every issue comment on the pull request, any author — the walkthrough blocks are the bot's among them
  issueComments: GitHubEntry[];
  // The newest review carrying a body: an older body still lists findings later commits fixed, and nothing edits it
  review: GitHubReview;
  threads: ReviewThread[];
}
