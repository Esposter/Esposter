import AssetsDevEsposterComHostname from "#src/cloudflare/constants/AssetsDevEsposterComHostname";
import DevWebWorkerScriptName from "#src/cloudflare/constants/DevWebWorkerScriptName";
import { esposterCom } from "#src/cloudflare/resources/zones/esposterCom";
import { CLOUDFLARE_ACCOUNT_ID } from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

export const assetsDevEsposterComCustomDomain: cloudflare.WorkersCustomDomain = new cloudflare.WorkersCustomDomain(
  AssetsDevEsposterComHostname,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    hostname: AssetsDevEsposterComHostname,
    service: DevWebWorkerScriptName,
    zoneId: esposterCom.id,
  },
  { parent: esposterCom, protect: true },
);
