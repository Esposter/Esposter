import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

export interface WindowStackWalkInput {
  collectorSha: string;
  cwd: string;
  developSha: string;
  isDryRun: boolean;
  queueSha: string;
  // The fixes branch as the run read it, which each drain moves on from
  reviewFixesSha?: string;
  // The open window pull requests, bottom up
  stack: WindowPullRequest[];
  viewerLogin: string;
}
