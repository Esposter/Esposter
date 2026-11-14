import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareZoneId from "#src/cloudflare/constants/CloudflareZoneId";
import {
  CloudflareAssetType,
  CloudflareEnvironment,
  CloudflareWorkerPurpose,
  getCloudflareResourceName,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const hostname = "assets.esposter.com";
const service = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Web,
);

export const assetsEsposterComCustomDomain: cloudflare.WorkersCustomDomain = new cloudflare.WorkersCustomDomain(
  hostname,
  { accountId: CloudflareAccountId, hostname, service, zoneId: CloudflareZoneId },
  { protect: true },
);
