import { configuration } from "#src/configuration";
import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

export const azureSubscriptionId: github.ActionsSecret = new github.ActionsSecret(
  "actionsSecret-AZURE-SUBSCRIPTION-ID",
  {
    repository: repository.name,
    secretName: "AZURE_SUBSCRIPTION_ID",
    value: configuration.require("AZURE_SUBSCRIPTION_ID"),
  },
  {
    protect: true,
  },
);
