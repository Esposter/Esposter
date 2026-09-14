import type { ReleasePullRequestState } from "#src/models/coderabbit/collect/ReleasePullRequestState";

// The newest pull request from develop to main, whatever its state — the base and head are the query's own filter
export interface ReleasePullRequest {
  number: number;
  state: ReleasePullRequestState;
}
