import * as github from "@pulumi/github";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

export const azureTenantId: github.ActionsSecret = new github.ActionsSecret(
  "actionsSecret-AZURE-TENANT-ID",
  {
    plaintextValue: config.require("AZURE_TENANT_ID"),
    repository: "Esposter",
    secretName: "AZURE_TENANT_ID",
  },
  {
    protect: true,
  },
);
