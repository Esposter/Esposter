// A workflow run's jobs as `gh run view --json workflowName,jobs` prints them, GitHub's own spelling
export interface RunJobsView {
  jobs: { conclusion: string; name: string }[];
  workflowName: string;
}
