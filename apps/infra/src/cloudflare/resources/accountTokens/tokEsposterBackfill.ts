import { tokenAdminProvider } from "#src/cloudflare/providers/tokenAdminProvider";
import { getAccountTokenPermissionGroupId } from "#src/cloudflare/services/getAccountTokenPermissionGroupId";
import { CLOUDFLARE_ACCOUNT_ID, CloudflareAssetType, getCloudflareAccountResourceName } from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

// The backfill consumer's token: the D1 reads and writes of a backfill run, through the D1 HTTP API, and no other group
export const tokEsposterBackfill: cloudflare.AccountToken = new cloudflare.AccountToken(
  getCloudflareAccountResourceName(CloudflareAssetType.Token, "backfill"),
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    name: getCloudflareAccountResourceName(CloudflareAssetType.Token, "backfill"),
    policies: [
      {
        effect: "allow",
        permissionGroups: [{ id: getAccountTokenPermissionGroupId("D1 Write") }],
        resources: JSON.stringify({ [`com.cloudflare.api.account.${CLOUDFLARE_ACCOUNT_ID}`]: "*" }),
      },
    ],
  },
  { protect: true, provider: tokenAdminProvider },
);
