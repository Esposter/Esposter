// An issue as `gh issue view --json` returns it, narrowed to what a label is decided from
export interface TriageIssue {
  body: string;
  labels: { name: string }[];
  title: string;
}
