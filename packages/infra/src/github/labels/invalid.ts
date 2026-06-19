import * as github from "@pulumi/github";

export const invalid: github.IssueLabel = new github.IssueLabel(
  "label-invalid",
  {
    color: "e4e669",
    description: "This doesn't seem right",
    name: "invalid",
    repository: "Esposter",
  },
  {
    protect: true,
  },
);
