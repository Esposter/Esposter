import { repository } from "@/github/repository";
import * as github from "@pulumi/github";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

export const azureTenantId: github.ActionsSecret = new github.ActionsSecret(
  "actionsSecret-AZURE-TENANT-ID",
  {
    repository: repository.name,
    secretName: "AZURE_TENANT_ID",
    value: config.require("AZURE_TENANT_ID"),
  },
  {
    protect: true,
  },
);
