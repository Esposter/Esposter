import { repository } from "@/github/repository";
import * as github from "@pulumi/github";

export const rfSurdsman: github.RepositoryCollaborator = new github.RepositoryCollaborator(
  "collaborator-RFSurdsman",
  {
    permission: "push",
    repository: repository.name,
    username: "RFSurdsman",
  },
  {
    protect: true,
  },
);
