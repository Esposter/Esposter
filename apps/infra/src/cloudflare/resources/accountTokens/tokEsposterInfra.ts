import { tokenAdminProvider } from "#src/cloudflare/providers/tokenAdminProvider";
import { getAccountTokenPermissionGroupId } from "#src/cloudflare/services/getAccountTokenPermissionGroupId";
import { CLOUDFLARE_ACCOUNT_ID, CloudflareAssetType, getCloudflareAccountResourceName } from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

// The infra provider's token: every kind of resource the program declares, and no more.
// A policy's resources name one scope, so the account's groups and the zones' groups are two policies. An account-owned
// Token reaches zones only nested under its account, so the zone policy names every zone of the account
export const tokEsposterInfra: cloudflare.AccountToken = new cloudflare.AccountToken(
  getCloudflareAccountResourceName(CloudflareAssetType.Token, "infra"),
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    name: getCloudflareAccountResourceName(CloudflareAssetType.Token, "infra"),
    policies: [
      {
        effect: "allow",
        permissionGroups: [
          "Account Settings Read",
          "D1 Write",
          "Queues Write",
          "Workers R2 Storage Write",
          "Workers Scripts Write",
        ].map((name) => ({ id: getAccountTokenPermissionGroupId(name) })),
        resources: JSON.stringify({ [`com.cloudflare.api.account.${CLOUDFLARE_ACCOUNT_ID}`]: "*" }),
      },
      {
        effect: "allow",
        permissionGroups: [
          "Bot Management Write",
          "Cache Settings Write",
          "DNS Write",
          "Workers Routes Write",
          "Zone DNS Settings Write",
          "Zone Read",
          "Zone Settings Write",
          "Zone Transform Rules Write",
          "Zone Write",
        ].map((name) => ({ id: getAccountTokenPermissionGroupId(name) })),
        resources: JSON.stringify({
          [`com.cloudflare.api.account.${CLOUDFLARE_ACCOUNT_ID}`]: { "com.cloudflare.api.account.zone.*": "*" },
        }),
      },
    ],
  },
  { protect: true, provider: tokenAdminProvider },
);
