import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

export const needsInfo: github.IssueLabel = new github.IssueLabel(
  "label-needs-info",
  {
    color: "D876E3",
    description: "Waiting on reporter for more information",
    name: "needs-info",
    repository: repository.name,
  },
  { protect: true },
);
