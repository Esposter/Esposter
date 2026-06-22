import { repository } from "@/github/repository";
import * as github from "@pulumi/github";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

export const azureSubscriptionId: github.ActionsSecret = new github.ActionsSecret(
  "actionsSecret-AZURE-SUBSCRIPTION-ID",
  {
    repository: repository.name,
    secretName: "AZURE_SUBSCRIPTION_ID",
    value: config.require("AZURE_SUBSCRIPTION_ID"),
  },
  {
    protect: true,
  },
);
