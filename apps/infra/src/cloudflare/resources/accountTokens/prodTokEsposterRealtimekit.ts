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

// The prod RealtimeKit token, for the realtime Worker's calls and for `realtimekit:provision`.
// Both make Realtime Admin calls, so one token serves both.
export const prodTokEsposterRealtimekit: cloudflare.AccountToken = new cloudflare.AccountToken(
  getCloudflareResourceName(CloudflareEnvironment.Production, CloudflareAssetType.Token, "realtimekit"),
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    name: getCloudflareResourceName(CloudflareEnvironment.Production, CloudflareAssetType.Token, "realtimekit"),
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
