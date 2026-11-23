import { devR2EsposterPublicHostedAssets } from "#src/cloudflare/resources/r2Buckets/devR2EsposterPublicHostedAssets";
import { esposterCom } from "#src/cloudflare/resources/zones/esposterCom";
import { CLOUDFLARE_ACCOUNT_ID, CloudflareEnvironment, HostedAssetOriginMap } from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const hostname = new URL(HostedAssetOriginMap[CloudflareEnvironment.Development]).hostname;

export const hostedDevEsposterComCustomDomain: cloudflare.R2CustomDomain = new cloudflare.R2CustomDomain(
  hostname,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    bucketName: devR2EsposterPublicHostedAssets.name,
    domain: hostname,
    enabled: true,
    zoneId: esposterCom.id,
  },
  { parent: esposterCom, protect: true },
);
