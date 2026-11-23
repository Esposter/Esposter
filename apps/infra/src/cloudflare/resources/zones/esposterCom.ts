import EsposterComDomain from "#src/cloudflare/constants/EsposterComDomain";
import { cloudflareProvider } from "#src/cloudflare/providers/cloudflareProvider";
import { CLOUDFLARE_ACCOUNT_ID } from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

// The zone every hostname under esposter.com is routed in. A zone is account-scoped and named by its domain.
// Its logical name is therefore the domain itself
export const esposterCom: cloudflare.Zone = new cloudflare.Zone(
  EsposterComDomain,
  { account: { id: CLOUDFLARE_ACCOUNT_ID }, name: EsposterComDomain, type: "full" },
  { protect: true, provider: cloudflareProvider },
);
