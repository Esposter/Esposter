import DevWebWorkerScriptName from "#src/cloudflare/constants/DevWebWorkerScriptName";
import { esposterCom } from "#src/cloudflare/resources/zones/esposterCom";
import { CLOUDFLARE_ACCOUNT_ID } from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const hostname = "dev.esposter.com";

export const devEsposterComCustomDomain: cloudflare.WorkersCustomDomain = new cloudflare.WorkersCustomDomain(
  hostname,
  { accountId: CLOUDFLARE_ACCOUNT_ID, hostname, service: DevWebWorkerScriptName, zoneId: esposterCom.id },
  { parent: esposterCom, protect: true },
);
