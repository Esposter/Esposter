import { repository } from "@/github/repository";
import * as github from "@pulumi/github";

export const wontfix: github.IssueLabel = new github.IssueLabel(
  "label-wontfix",
  {
    color: "ffffff",
    description: "This will not be worked on",
    name: "wontfix",
    repository: repository.name,
  },
  {
    protect: true,
  },
);
