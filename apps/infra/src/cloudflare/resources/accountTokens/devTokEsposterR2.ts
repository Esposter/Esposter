import { tokenAdminProvider } from "#src/cloudflare/providers/tokenAdminProvider";
import { getAccountTokenPermissionGroupId } from "#src/cloudflare/services/getAccountTokenPermissionGroupId";
import { getR2BucketResources } from "#src/cloudflare/services/getR2BucketResources";
import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  CloudflareEnvironment,
  getCloudflareResourceName,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

// The dev R2 publishers' token: every bucket of the dev environment, and nothing in the other one
export const devTokEsposterR2: cloudflare.AccountToken = new cloudflare.AccountToken(
  getCloudflareResourceName(CloudflareEnvironment.Development, CloudflareAssetType.Token, "r2"),
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    name: getCloudflareResourceName(CloudflareEnvironment.Development, CloudflareAssetType.Token, "r2"),
    policies: [
      {
        effect: "allow",
        permissionGroups: [{ id: getAccountTokenPermissionGroupId("Workers R2 Storage Bucket Item Write") }],
        resources: JSON.stringify(getR2BucketResources(CloudflareEnvironment.Development)),
      },
    ],
  },
  { protect: true, provider: tokenAdminProvider },
);
