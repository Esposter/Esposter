import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import { esposterCom } from "#src/cloudflare/resources/zones/esposterCom";
import {
  CloudflareAssetType,
  CloudflareEnvironment,
  CloudflareWorkerPurpose,
  getCloudflareResourceName,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const hostname = "next.esposter.com";
const service = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Web,
);

export const nextEsposterComCustomDomain: cloudflare.WorkersCustomDomain = new cloudflare.WorkersCustomDomain(
  hostname,
  { accountId: CloudflareAccountId, hostname, service, zoneId: esposterCom.id },
  { parent: esposterCom, protect: true },
);
