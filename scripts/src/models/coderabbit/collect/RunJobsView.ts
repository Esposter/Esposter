// A workflow run's jobs as `gh run view --json workflowName,jobs` prints them, GitHub's own spelling — a job's
// `databaseId` is its check run's id, which its annotations are listed by
export interface RunJobsView {
  jobs: { conclusion: string; databaseId: number; name: string }[];
  workflowName: string;
}
