import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareZoneId from "#src/cloudflare/constants/CloudflareZoneId";
import {
  CloudflareAssetType,
  CloudflareEnvironment,
  CloudflareWorkerPurpose,
  getCloudflareResourceName,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const hostname = "assets.dev.esposter.com";
const service = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Web,
);

export const assetsDevEsposterComCustomDomain: cloudflare.WorkersCustomDomain = new cloudflare.WorkersCustomDomain(
  hostname,
  { accountId: CloudflareAccountId, hostname, service, zoneId: CloudflareZoneId },
  { protect: true },
);
