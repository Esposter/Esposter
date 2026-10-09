// A workflow run as `gh run list --json` prints it (`CHECK_RUN_FIELDS`), GitHub's own spelling: its verdict, the branch
// It ran for and the commit it read, and when it was created and last updated — the span from a push to its verdict
export interface MainCheck {
  // Which run of it this is, counted from one: a re-run of its failed jobs is the same run under the next attempt
  attempt: number;
  conclusion: string;
  createdAt: string;
  databaseId: number;
  headBranch: string;
  headSha: string;
  status: string;
  updatedAt: string;
  url: string;
  workflowDatabaseId: number;
}
