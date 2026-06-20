import { repository } from "@/github/repository";
import * as github from "@pulumi/github";

export const documentation: github.IssueLabel = new github.IssueLabel(
  "label-documentation",
  {
    color: "0075ca",
    description: "Improvements or additions to documentation",
    name: "documentation",
    repository: repository.name,
  },
  {
    protect: true,
  },
);
