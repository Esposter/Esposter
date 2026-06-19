import * as github from "@pulumi/github";

export const wontfix: github.IssueLabel = new github.IssueLabel(
  "label-wontfix",
  {
    color: "ffffff",
    description: "This will not be worked on",
    name: "wontfix",
    repository: "Esposter",
  },
  {
    protect: true,
  },
);
