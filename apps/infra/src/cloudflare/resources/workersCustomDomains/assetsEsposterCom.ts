import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import CloudflareZoneId from "#src/cloudflare/constants/CloudflareZoneId";
import * as cloudflare from "@pulumi/cloudflare";

export const assetsEsposterCom: cloudflare.WorkersCustomDomain = new cloudflare.WorkersCustomDomain(
  "workersCustomDomain-assets.esposter.com",
  {
    accountId: CloudflareAccountId,
    hostname: "assets.esposter.com",
    service: CloudflareWorkerName.esposter,
    zoneId: CloudflareZoneId,
  },
  { protect: true },
);
