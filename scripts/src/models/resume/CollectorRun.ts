// The latest review collector workflow run, as `gh run list --json status,conclusion` reports it
export interface CollectorRun {
  conclusion: string;
  status: string;
}
