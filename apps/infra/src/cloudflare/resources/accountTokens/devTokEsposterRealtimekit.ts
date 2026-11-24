import { tokenAdminProvider } from "#src/cloudflare/providers/tokenAdminProvider";
import { getAccountTokenPermissionGroupId } from "#src/cloudflare/services/getAccountTokenPermissionGroupId";
import { getAccountWideResources } from "#src/cloudflare/services/getAccountWideResources";
import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  CloudflareEnvironment,
  getCloudflareResourceName,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const tokenName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.Token,
  "realtimekit",
);
// The dev RealtimeKit token, for the realtime Worker's calls and for `realtimekit:provision`.
// Both make Realtime Admin calls, so one token serves both.
export const devTokEsposterRealtimekit: cloudflare.AccountToken = new cloudflare.AccountToken(
  tokenName,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    name: tokenName,
    policies: [
      {
        effect: "allow",
        permissionGroups: [{ id: getAccountTokenPermissionGroupId("Realtime Admin") }],
        resources: JSON.stringify(getAccountWideResources()),
      },
    ],
  },
  { protect: true, provider: tokenAdminProvider },
);
