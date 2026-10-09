import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

export interface WindowChainInput {
  cwd: string;
  isDryRun: boolean;
  // The open window pull requests, and the release from `develop` while it is open, in any order
  stackPullRequests: WindowPullRequest[];
  viewerLogin: string;
}
