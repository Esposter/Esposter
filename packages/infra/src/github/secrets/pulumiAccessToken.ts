import { configuration } from "#src/configuration";
import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

export const pulumiAccessToken: github.ActionsSecret = new github.ActionsSecret(
  "actionsSecret-PULUMI-ACCESS-TOKEN",
  {
    repository: repository.name,
    secretName: "PULUMI_ACCESS_TOKEN",
    value: configuration.requireSecret("PULUMI_ACCESS_TOKEN"),
  },
  {
    protect: true,
  },
);
