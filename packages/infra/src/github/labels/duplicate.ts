import { repository } from "@/github/repository";
import * as github from "@pulumi/github";

export const duplicate: github.IssueLabel = new github.IssueLabel(
  "label-duplicate",
  {
    color: "cfd3d7",
    description: "This issue or pull request already exists",
    name: "duplicate",
    repository: repository.name,
  },
  {
    protect: true,
  },
);
