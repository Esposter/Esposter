import ProdWebWorkerScriptName from "#src/cloudflare/constants/ProdWebWorkerScriptName";
import { esposterCom } from "#src/cloudflare/resources/zones/esposterCom";
import { CLOUDFLARE_ACCOUNT_ID } from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const hostname = "esposter.com";

// The apex is the production web Worker's own domain, whose DNS record Cloudflare keeps
export const esposterComCustomDomain: cloudflare.WorkersCustomDomain = new cloudflare.WorkersCustomDomain(
  hostname,
  { accountId: CLOUDFLARE_ACCOUNT_ID, hostname, service: ProdWebWorkerScriptName, zoneId: esposterCom.id },
  { parent: esposterCom, protect: true },
);
