import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

export interface SyncQueueInput {
  cwd: string;
  developSha: string;
  isDryRun: boolean;
  // The release pull request's conversation, where a failed resolution is counted; none open means no count
  issueComments: GitHubEntry[];
  pullRequest?: number;
  queueSha: string;
  reviewFixesSha?: string;
  viewerLogin: string;
}
