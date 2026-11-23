import { tokEsposterDeploy } from "#src/cloudflare/resources/accountTokens/tokEsposterDeploy";
import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

// The Deploy workflow's token, the one its D1 migrations and wrangler deploys run under
export const cloudflareApiToken: github.ActionsSecret = new github.ActionsSecret(
  "actionsSecret-CLOUDFLARE-API-TOKEN",
  { repository: repository.name, secretName: "CLOUDFLARE_API_TOKEN", value: tokEsposterDeploy.value },
  { protect: true },
);
