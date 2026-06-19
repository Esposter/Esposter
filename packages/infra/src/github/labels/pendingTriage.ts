import * as github from "@pulumi/github";

export const pendingTriage: github.IssueLabel = new github.IssueLabel(
  "label-pending-triage",
  {
    color: "F9D0C4",
    name: "pending triage",
    repository: "Esposter",
  },
  {
    protect: true,
  },
);
