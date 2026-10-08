import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

export interface RetargetStrandedWindowsInput {
  cwd: string;
  isDryRun: boolean;
  openPullRequests: WindowPullRequest[];
  windowHistory: WindowPullRequest[];
}
