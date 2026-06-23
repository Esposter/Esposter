import { repository } from "@/github/repository";
import * as github from "@pulumi/github";

export const upstreamBug: github.IssueLabel = new github.IssueLabel(
  "label-upstream-bug",
  {
    color: "b60205",
    name: "upstream-bug",
    repository: repository.name,
  },
  {
    protect: true,
  },
);
