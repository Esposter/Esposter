import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

export interface RiskNoticeInput {
  // The head the clean review and the risk verdict both cover — the notice is posted once per head
  developSha: string;
  isDryRun: boolean;
  issueComments: GitHubEntry[];
  // The level the bot stated, above the one the collector merges on
  level: string;
  pullRequest: number;
  viewerLogin: string;
}
