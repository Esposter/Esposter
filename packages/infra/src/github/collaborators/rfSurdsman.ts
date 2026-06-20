import * as github from "@pulumi/github";

export const rfSurdsman: github.RepositoryCollaborator = new github.RepositoryCollaborator(
  "collaborator-RFSurdsman",
  {
    permission: "push",
    repository: "Esposter",
    username: "RFSurdsman",
  },
  {
    protect: true,
  },
);
