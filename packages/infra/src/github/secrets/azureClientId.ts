import * as github from "@pulumi/github";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

export const azureClientId: github.ActionsSecret = new github.ActionsSecret(
  "actionsSecret-AZURE-CLIENT-ID",
  {
    repository: "Esposter",
    secretName: "AZURE_CLIENT_ID",
    value: config.require("AZURE_CLIENT_ID"),
  },
  {
    protect: true,
  },
);
