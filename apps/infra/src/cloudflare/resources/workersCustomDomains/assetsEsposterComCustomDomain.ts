import AssetsEsposterComHostname from "#src/cloudflare/constants/AssetsEsposterComHostname";
import ProdWebWorkerScriptName from "#src/cloudflare/constants/ProdWebWorkerScriptName";
import { esposterCom } from "#src/cloudflare/resources/zones/esposterCom";
import { CLOUDFLARE_ACCOUNT_ID } from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

export const assetsEsposterComCustomDomain: cloudflare.WorkersCustomDomain = new cloudflare.WorkersCustomDomain(
  AssetsEsposterComHostname,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    hostname: AssetsEsposterComHostname,
    service: ProdWebWorkerScriptName,
    zoneId: esposterCom.id,
  },
  { parent: esposterCom, protect: true },
);
