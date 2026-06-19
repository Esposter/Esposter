import * as github from "@pulumi/github";

export const goodFirstIssue: github.IssueLabel = new github.IssueLabel(
  "label-good-first-issue",
  {
    color: "7057ff",
    description: "Good for newcomers",
    name: "good first issue",
    repository: "Esposter",
  },
  {
    protect: true,
  },
);
