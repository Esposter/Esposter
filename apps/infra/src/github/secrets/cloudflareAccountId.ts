import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

export const cloudflareAccountId: github.ActionsSecret = new github.ActionsSecret(
  "actionsSecret-CLOUDFLARE-ACCOUNT-ID",
  { repository: repository.name, secretName: "CLOUDFLARE_ACCOUNT_ID", value: CloudflareAccountId },
  { protect: true },
);
