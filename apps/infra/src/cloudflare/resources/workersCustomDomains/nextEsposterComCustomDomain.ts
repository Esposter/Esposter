import ProdWebWorkerScriptName from "#src/cloudflare/constants/ProdWebWorkerScriptName";
import { esposterCom } from "#src/cloudflare/resources/zones/esposterCom";
import { CLOUDFLARE_ACCOUNT_ID } from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const hostname = "next.esposter.com";

export const nextEsposterComCustomDomain: cloudflare.WorkersCustomDomain = new cloudflare.WorkersCustomDomain(
  hostname,
  { accountId: CLOUDFLARE_ACCOUNT_ID, hostname, service: ProdWebWorkerScriptName, zoneId: esposterCom.id },
  { parent: esposterCom, protect: true },
);
