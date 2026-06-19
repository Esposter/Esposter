import * as github from "@pulumi/github";

export const autoreleasePending: github.IssueLabel = new github.IssueLabel(
  "label-autorelease--pending",
  {
    color: "ededed",
    name: "autorelease: pending",
    repository: "Esposter",
  },
  {
    protect: true,
  },
);
