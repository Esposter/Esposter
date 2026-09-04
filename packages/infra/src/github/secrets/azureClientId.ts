import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";
import * as pulumi from "@pulumi/pulumi";

const configuration = new pulumi.Config();

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
