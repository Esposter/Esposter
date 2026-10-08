import type { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";

// A window pull request as `gh pr list` reports it: its head is the window's own branch, its base the window below
// It or `main`, and its creation time is what the hourly ceiling counts
export interface WindowPullRequest {
  baseRefName: string;
  createdAt: string;
  headRefName: string;
  number: number;
  state: WindowPullRequestState;
}
