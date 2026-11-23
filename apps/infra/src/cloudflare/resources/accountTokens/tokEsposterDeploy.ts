import { tokenAdminProvider } from "#src/cloudflare/providers/tokenAdminProvider";
import { getAccountTokenPermissionGroupId } from "#src/cloudflare/services/getAccountTokenPermissionGroupId";
import { CLOUDFLARE_ACCOUNT_ID, CloudflareAssetType, getCloudflareAccountResourceName } from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

// The Deploy workflow's token: the D1 migrations and the wrangler deploys of the three Workers, and no zone or infra group
export const tokEsposterDeploy: cloudflare.AccountToken = new cloudflare.AccountToken(
  getCloudflareAccountResourceName(CloudflareAssetType.Token, "deploy"),
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    name: getCloudflareAccountResourceName(CloudflareAssetType.Token, "deploy"),
    policies: [
      {
        effect: "allow",
        permissionGroups: ["Account Settings Read", "D1 Write", "Queues Write", "Workers Scripts Write"].map(
          (name) => ({ id: getAccountTokenPermissionGroupId(name) }),
        ),
        resources: JSON.stringify({ [`com.cloudflare.api.account.${CLOUDFLARE_ACCOUNT_ID}`]: "*" }),
      },
    ],
  },
  { protect: true, provider: tokenAdminProvider },
);
