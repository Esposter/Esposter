import { repository } from "@/github/repository";
import * as github from "@pulumi/github";

export const production: github.RepositoryEnvironment = new github.RepositoryEnvironment(
  "environment-Esposter---production",
  {
    environment: "Esposter / production",
    repository: repository.name,
  },
  {
    protect: true,
  },
);
