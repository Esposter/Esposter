import type { AnsweredCommit } from "#src/models/coderabbit/collect/AnsweredCommit";
import type { CycleInput } from "#src/models/coderabbit/collect/CycleInput";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";

// What the cycle hands the drain step: the reads it already holds, and the refs the open set is measured against.
// The step computes the open set itself — nothing outside it reads one.
export interface DrainStepInput extends Pick<CycleInput, "collectorSha"> {
  // The cycle's tree, so the open set is measured against the repository the pass is running on
  cwd: string;
  // Commits `develop` carries above `main` — a window pushed but not yet opened — whose trailers answer already
  developCommits: AnsweredCommit[];
  developSha: string;
  isDryRun: boolean;
  issueComments: GitHubEntry[];
  pullRequest: number;
  queueSha: string;
  reviewFixesSha?: string;
  reviews: GitHubReview[];
  viewerLogin: string;
}
