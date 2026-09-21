import type { AnsweredCommit } from "#src/models/coderabbit/collect/AnsweredCommit";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";

// What the cycle hands the drain step: the reads it already holds, and the refs the open set is measured against.
// The step computes the open set itself — nothing outside it reads one.
export interface DrainStepInput {
  // The basis the drain's attempts are counted against (`getMarker`)
  collectorSha: string;
  // The cycle's tree, so the open set is measured against the repository the pass is running on
  cwd: string;
  developSha: string;
  // Commits the window already carries; their `Drains` trailers answer a review body the bot has not re-read
  frontierCommits: AnsweredCommit[];
  isDryRun: boolean;
  issueComments: GitHubEntry[];
  pullRequest: number;
  queueSha: string;
  reviewFixesSha?: string;
  reviews: GitHubReview[];
  viewerLogin: string;
}
