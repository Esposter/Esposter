import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

export const readyForAgent: github.IssueLabel = new github.IssueLabel(
  "label-ready-for-agent",
  {
    color: "0E8A16",
    description: "Fully specified, ready for an AFK agent",
    name: "ready-for-agent",
    repository: repository.name,
  },
  { protect: true },
);
