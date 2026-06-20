import { repository } from "@/github/repository";
import * as github from "@pulumi/github";

export const helpWanted: github.IssueLabel = new github.IssueLabel(
  "label-help-wanted",
  {
    color: "008672",
    description: "Extra attention is needed",
    name: "help wanted",
    repository: repository.name,
  },
  {
    protect: true,
  },
);
