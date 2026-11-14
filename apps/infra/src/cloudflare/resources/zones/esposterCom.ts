import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

// The zone every hostname under esposter.com is routed in. A zone is account-scoped and named by its domain, so its
// logical name is the domain itself
const domainName = "esposter.com";

export const esposterCom: cloudflare.Zone = new cloudflare.Zone(
  domainName,
  { account: { id: CloudflareAccountId }, name: domainName, type: "full" },
  { protect: true },
);
