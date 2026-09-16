import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";

export interface ReleaseVerdictInput {
  cwd: string;
  // The head the clean review and the risk verdict both cover — judged once
  developSha: string;
  isDryRun: boolean;
  issueComments: GitHubEntry[];
  // The level the bot stated, above the one the collector merges on unasked
  level: string;
  pullRequest: number;
  reviews: GitHubReview[];
  viewerLogin: string;
}
