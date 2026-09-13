// The one field `gh pr list --json number` answers with; the base and head are the query's own filter
export interface OpenPullRequest {
  number: number;
}
