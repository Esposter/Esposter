import { repository } from "@/github/repository";
import * as github from "@pulumi/github";

export const develop: github.RepositoryEnvironment = new github.RepositoryEnvironment(
  "environment-Esposter---develop",
  {
    environment: "Esposter / develop",
    repository: repository.name,
  },
  {
    protect: true,
  },
);
