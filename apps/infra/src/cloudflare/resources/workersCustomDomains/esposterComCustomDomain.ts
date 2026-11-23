import EsposterComDomain from "#src/cloudflare/constants/EsposterComDomain";
import ProdWebWorkerScriptName from "#src/cloudflare/constants/ProdWebWorkerScriptName";
import { cloudflareProvider } from "#src/cloudflare/providers/cloudflareProvider";
import { esposterCom } from "#src/cloudflare/resources/zones/esposterCom";
import { CLOUDFLARE_ACCOUNT_ID } from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

// The apex is the production web Worker's own domain, whose DNS record Cloudflare keeps
export const esposterComCustomDomain: cloudflare.WorkersCustomDomain = new cloudflare.WorkersCustomDomain(
  EsposterComDomain,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    hostname: EsposterComDomain,
    service: ProdWebWorkerScriptName,
    zoneId: esposterCom.id,
  },
  { parent: esposterCom, protect: true, provider: cloudflareProvider },
);
