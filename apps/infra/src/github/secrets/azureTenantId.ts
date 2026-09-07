import { configuration } from "#src/configuration";
import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

export const azureTenantId: github.ActionsSecret = new github.ActionsSecret(
  "actionsSecret-AZURE-TENANT-ID",
  {
    repository: repository.name,
    secretName: "AZURE_TENANT_ID",
    value: configuration.require("AZURE_TENANT_ID"),
  },
  {
    protect: true,
  },
);
