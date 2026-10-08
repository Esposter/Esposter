import type { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";

// A window pull request as `gh pr list` reports it: its head is the window's own branch, its base the window below
// It or `main`, its head's last commit what `main` is checked for, and its creation time is what the hourly ceiling
// Counts
export interface WindowPullRequest {
  baseRefName: string;
  createdAt: string;
  headRefName: string;
  headRefOid: string;
  number: number;
  state: WindowPullRequestState;
}
