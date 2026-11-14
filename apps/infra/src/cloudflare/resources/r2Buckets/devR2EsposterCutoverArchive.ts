import CloudflareLocationHint from "#src/cloudflare/constants/CloudflareLocationHint";
import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  CloudflareEnvironment,
  getCloudflareResourceName,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

// The cutover's private archive: its checkpoints, the id map and the source snapshots. No Worker binds it, and it is
// Deleted with the cutover command at teardown
const bucketName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.R2Bucket,
  "cutover-archive",
);

export const devR2EsposterCutoverArchive: cloudflare.R2Bucket = new cloudflare.R2Bucket(
  bucketName,
  { accountId: CLOUDFLARE_ACCOUNT_ID, location: CloudflareLocationHint, name: bucketName },
  { protect: true },
);
