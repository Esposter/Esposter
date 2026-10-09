// A workflow run as `gh run list --json` prints it (`CHECK_RUN_FIELDS`), GitHub's own spelling: its verdict, the branch
// It ran for and the commit it read, and when it was created and last updated — the span from a push to its verdict
export interface MainCheck {
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
