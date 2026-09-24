import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";

export interface ReleaseVerdictInput {
  cwd: string;
  // The head the clean review and the risk verdict both cover — judged once
  developSha: string;
  isDryRun: boolean;
  issueComments: GitHubEntry[];
  // The level the bot stated for this head, above the one the collector merges on unasked — absent when its
  // Walkthrough carries no merge-risk block at all, which is a head to judge and never one to merge unasked
  level?: string;
  pullRequest: number;
  reviews: GitHubReview[];
  // The last sha a review read, when the bot skipped the head: the commits after it no review has read at all
  unreviewedFromSha?: string;
  viewerLogin: string;
}
