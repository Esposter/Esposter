import { repository } from "@/github/repository";
import * as github from "@pulumi/github";

export const bug: github.IssueLabel = new github.IssueLabel(
  "label-bug",
  {
    color: "d73a4a",
    description: "Something isn't working",
    name: "bug",
    repository: repository.name,
  },
  {
    protect: true,
  },
);
