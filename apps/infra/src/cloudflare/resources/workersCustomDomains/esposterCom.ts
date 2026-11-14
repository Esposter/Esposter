import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import CloudflareZoneId from "#src/cloudflare/constants/CloudflareZoneId";
import * as cloudflare from "@pulumi/cloudflare";

export const esposterCom: cloudflare.WorkersCustomDomain = new cloudflare.WorkersCustomDomain(
  "workersCustomDomain-esposter.com",
  {
    accountId: CloudflareAccountId,
    hostname: "esposter.com",
    service: CloudflareWorkerName.esposter,
    zoneId: CloudflareZoneId,
  },
  { protect: true },
);
