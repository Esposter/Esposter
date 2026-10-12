import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

// The review's own issues, outside the five triage roles: each holds findings the review owes until its settle job
// Closes it, so no session or triage pass takes one
export const review: github.IssueLabel = new github.IssueLabel(
  "label-review",
  {
    color: "5319E7",
    description: "Findings the review owes until its settle job closes the issue",
    name: "review",
    repository: repository.name,
  },
  { protect: true },
);
