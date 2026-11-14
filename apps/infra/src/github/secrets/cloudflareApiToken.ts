import { cloudflareConfiguration } from "#src/configuration";
import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

// The one token both stacks and the deploy job use, set in ESC as `cloudflare:apiToken`
export const cloudflareApiToken: github.ActionsSecret = new github.ActionsSecret(
  "actionsSecret-CLOUDFLARE-API-TOKEN",
  {
    repository: repository.name,
    secretName: "CLOUDFLARE_API_TOKEN",
    value: cloudflareConfiguration.requireSecret("apiToken"),
  },
  { protect: true },
);
