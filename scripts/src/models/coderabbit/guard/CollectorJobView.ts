// One job of a collector run as `gh run view --json jobs` prints it, GitHub's own spelling — its id is the check run
// Its annotations hang off
export interface CollectorJobView {
  conclusion: string;
  databaseId: number;
  name: string;
  steps: { conclusion: string; name: string }[];
}
