import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import { esposterCom } from "#src/cloudflare/resources/zones/esposterCom";
import {
  CloudflareAssetType,
  CloudflareEnvironment,
  CloudflareWorkerPurpose,
  getCloudflareResourceName,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const hostname = "esposter.com";
const service = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Web,
);

export const esposterComCustomDomain: cloudflare.WorkersCustomDomain = new cloudflare.WorkersCustomDomain(
  hostname,
  { accountId: CloudflareAccountId, hostname, service, zoneId: esposterCom.id },
  { parent: esposterCom, protect: true },
);
