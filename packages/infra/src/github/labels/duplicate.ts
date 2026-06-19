import * as github from "@pulumi/github";

export const duplicate: github.IssueLabel = new github.IssueLabel(
  "label-duplicate",
  {
    color: "cfd3d7",
    description: "This issue or pull request already exists",
    name: "duplicate",
    repository: "Esposter",
  },
  {
    protect: true,
  },
);
