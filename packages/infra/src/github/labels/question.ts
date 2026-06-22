import { repository } from "@/github/repository";
import * as github from "@pulumi/github";

export const question: github.IssueLabel = new github.IssueLabel(
  "label-question",
  {
    color: "d876e3",
    description: "Further information is requested",
    name: "question",
    repository: repository.name,
  },
  {
    protect: true,
  },
);
