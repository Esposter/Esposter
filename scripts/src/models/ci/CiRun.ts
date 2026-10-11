// One workflow run as `gh run list --json` gives the fields the watch reads
export interface CiRun {
  conclusion: string;
  createdAt: string;
  databaseId: number;
  headSha: string;
  status: string;
  workflowName: string;
}
