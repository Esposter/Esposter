import * as github from "@pulumi/github";

export const production: github.RepositoryEnvironment = new github.RepositoryEnvironment(
  "environment-Esposter---production",
  {
    environment: "Esposter / production",
    repository: "Esposter",
  },
  {
    protect: true,
  },
);
