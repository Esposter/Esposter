import { repository } from "@/github/repository";
import * as github from "@pulumi/github";

export const autoreleasePending: github.IssueLabel = new github.IssueLabel(
  "label-autorelease--pending",
  {
    color: "ededed",
    name: "autorelease: pending",
    repository: repository.name,
  },
  {
    protect: true,
  },
);
