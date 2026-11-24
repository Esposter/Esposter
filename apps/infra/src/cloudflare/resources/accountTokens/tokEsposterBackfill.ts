import { tokenAdminProvider } from "#src/cloudflare/providers/tokenAdminProvider";
import { getAccountTokenPermissionGroupId } from "#src/cloudflare/services/getAccountTokenPermissionGroupId";
import { getAccountWideResources } from "#src/cloudflare/services/getAccountWideResources";
import { CLOUDFLARE_ACCOUNT_ID, CloudflareAssetType, getCloudflareAccountResourceName } from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const tokenName = getCloudflareAccountResourceName(CloudflareAssetType.Token, "backfill");
// The backfill consumer's token: the D1 reads and writes of a backfill run, through the D1 HTTP API, and no other group
export const tokEsposterBackfill: cloudflare.AccountToken = new cloudflare.AccountToken(
  tokenName,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    name: tokenName,
    policies: [
      {
        effect: "allow",
        permissionGroups: [{ id: getAccountTokenPermissionGroupId("D1 Write") }],
        resources: JSON.stringify(getAccountWideResources()),
      },
    ],
  },
  { protect: true, provider: tokenAdminProvider },
);
