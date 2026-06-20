import { repository } from "@/github/repository";
import * as github from "@pulumi/github";

export const feature: github.IssueLabel = new github.IssueLabel(
  "label-feature",
  {
    color: "a2eeef",
    description: "New feature or request",
    name: "feature",
    repository: repository.name,
  },
  {
    protect: true,
  },
);
