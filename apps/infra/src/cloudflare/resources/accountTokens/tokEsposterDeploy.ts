import { tokenAdminProvider } from "#src/cloudflare/providers/tokenAdminProvider";
import { getAccountTokenPermissionGroupId } from "#src/cloudflare/services/getAccountTokenPermissionGroupId";
import { getAccountWideResources } from "#src/cloudflare/services/getAccountWideResources";
import { CLOUDFLARE_ACCOUNT_ID, CloudflareAssetType, getCloudflareAccountResourceName } from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const tokenName = getCloudflareAccountResourceName(CloudflareAssetType.Token, "deploy");
// The Deploy workflow's token: the D1 migrations and the wrangler deploys of the three Workers, and no zone or infra
// Group
export const tokEsposterDeploy: cloudflare.AccountToken = new cloudflare.AccountToken(
  tokenName,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    name: tokenName,
    policies: [
      {
        effect: "allow",
        permissionGroups: ["Account Settings Read", "D1 Write", "Queues Write", "Workers Scripts Write"].map(
          (name) => ({ id: getAccountTokenPermissionGroupId(name) }),
        ),
        resources: JSON.stringify(getAccountWideResources()),
      },
    ],
  },
  { protect: true, provider: tokenAdminProvider },
);
