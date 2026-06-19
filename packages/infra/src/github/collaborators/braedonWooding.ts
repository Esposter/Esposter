import * as github from "@pulumi/github";

export const braedonWooding: github.RepositoryCollaborator = new github.RepositoryCollaborator(
  "collaborator-BraedonWooding",
  {
    repository: "Esposter",
    username: "BraedonWooding",
  },
  {
    protect: true,
  },
);
