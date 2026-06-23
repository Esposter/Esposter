import { repository } from "@/github/repository";
import * as github from "@pulumi/github";

export const braedonWooding: github.RepositoryCollaborator = new github.RepositoryCollaborator(
  "collaborator-BraedonWooding",
  {
    permission: "push",
    repository: repository.name,
    username: "BraedonWooding",
  },
  {
    protect: true,
  },
);
