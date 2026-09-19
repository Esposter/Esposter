import { configuration } from "#src/configuration";
import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

export const typesafeApiKey: github.ActionsSecret = new github.ActionsSecret(
  "actionsSecret-TYPESAFE-API-KEY",
  {
    repository: repository.name,
    secretName: "TYPESAFE_API_KEY",
    value: configuration.requireSecret("TYPESAFE_API_KEY"),
  },
  {
    protect: true,
  },
);
