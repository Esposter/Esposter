import * as github from "@pulumi/github";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

export const pulumiAccessToken: github.ActionsSecret = new github.ActionsSecret(
  "actionsSecret-PULUMI-ACCESS-TOKEN",
  {
    plaintextValue: config.requireSecret("PULUMI_ACCESS_TOKEN"),
    repository: "Esposter",
    secretName: "PULUMI_ACCESS_TOKEN",
  },
  {
    protect: true,
  },
);
