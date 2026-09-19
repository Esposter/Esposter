import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

export const needsTriage: github.IssueLabel = new github.IssueLabel(
  "label-needs-triage",
  {
    color: "FBCA04",
    description: "Maintainer needs to evaluate this issue",
    name: "needs-triage",
    repository: repository.name,
  },
  {
    protect: true,
  },
);
