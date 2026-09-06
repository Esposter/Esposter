import { configuration } from "#src/configuration";
import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

export const azureClientId: github.ActionsSecret = new github.ActionsSecret(
  "actionsSecret-AZURE-CLIENT-ID",
  {
    repository: repository.name,
    secretName: "AZURE_CLIENT_ID",
    value: configuration.require("AZURE_CLIENT_ID"),
  },
  {
    protect: true,
  },
);
