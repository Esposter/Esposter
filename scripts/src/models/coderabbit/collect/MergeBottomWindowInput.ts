import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

export interface MergeBottomWindowInput {
  collectorSha: string;
  cwd: string;
  developSha: string;
  isDryRun: boolean;
  // The window stacked directly above the bottom one, which is retargeted to `main` before the bottom one's branch goes
  next?: WindowPullRequest;
  queueSha: string;
  reviewFixesSha?: string;
  viewerLogin: string;
  // The bottom window, whose review has completed
  window: WindowPullRequest;
}
