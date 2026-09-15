import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

export interface SyncQueueInput {
  cwd: string;
  developSha: string;
  isDryRun: boolean;
  // The release pull request's conversation, where a failed resolution is counted; with none open nothing can
  // Hold the count, so a conflict is left to a person rather than resolved
  issueComments: GitHubEntry[];
  pullRequest?: number;
  queueSha: string;
  reviewFixesSha?: string;
  viewerLogin: string;
}
