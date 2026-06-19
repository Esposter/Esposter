import * as github from "@pulumi/github";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

export const azureSubscriptionId: github.ActionsSecret = new github.ActionsSecret(
  "actionsSecret-AZURE-SUBSCRIPTION-ID",
  {
    plaintextValue: config.require("AZURE_SUBSCRIPTION_ID"),
    repository: "Esposter",
    secretName: "AZURE_SUBSCRIPTION_ID",
  },
  {
    protect: true,
  },
);
