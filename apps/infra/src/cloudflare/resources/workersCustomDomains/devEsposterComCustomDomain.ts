import { esposterCom } from "#src/cloudflare/resources/zones/esposterCom";
import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  CloudflareEnvironment,
  CloudflareWorkerPurpose,
  getCloudflareResourceName,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const hostname = "dev.esposter.com";
const service = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Web,
);

export const devEsposterComCustomDomain: cloudflare.WorkersCustomDomain = new cloudflare.WorkersCustomDomain(
  hostname,
  { accountId: CLOUDFLARE_ACCOUNT_ID, hostname, service, zoneId: esposterCom.id },
  { parent: esposterCom, protect: true },
);
