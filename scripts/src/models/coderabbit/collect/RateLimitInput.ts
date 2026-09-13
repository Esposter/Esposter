import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

export interface RateLimitInput {
  isDryRun: boolean;
  // The pull request's issue comments, read once by the caller — the bot's rate-limit block is one of them
  issueComments: GitHubEntry[];
  pullRequest: number;
  viewerLogin: string;
}
