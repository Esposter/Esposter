import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

export const readyForHuman: github.IssueLabel = new github.IssueLabel(
  "label-ready-for-human",
  {
    color: "1D76DB",
    description: "Requires human implementation",
    name: "ready-for-human",
    repository: repository.name,
  },
  {
    protect: true,
  },
);
