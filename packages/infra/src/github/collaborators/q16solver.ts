import * as github from "@pulumi/github";

export const q16solver: github.RepositoryCollaborator = new github.RepositoryCollaborator(
  "collaborator-Q16solver",
  {
    permission: "admin",
    repository: "Esposter",
    username: "Q16solver",
  },
  {
    protect: true,
  },
);
