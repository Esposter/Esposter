import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import CloudflareZoneId from "#src/cloudflare/constants/CloudflareZoneId";
import * as cloudflare from "@pulumi/cloudflare";

export const devEsposterCom: cloudflare.WorkersCustomDomain = new cloudflare.WorkersCustomDomain(
  "workersCustomDomain-dev.esposter.com",
  {
    accountId: CloudflareAccountId,
    hostname: "dev.esposter.com",
    service: CloudflareWorkerName.esposterDev,
    zoneId: CloudflareZoneId,
  },
  { protect: true },
);
