import { esposterCom } from "#src/cloudflare/resources/zones/esposterCom";
import * as cloudflare from "@pulumi/cloudflare";

// The zone's DNSSEC signing. Cloudflare is both the registrar and the DNS host, so it publishes the DS record at the
// Registry itself once signing is on, which takes one to two days
export const esposterComDnssec: cloudflare.ZoneDnssec = new cloudflare.ZoneDnssec(
  "esposter.com-dnssec",
  { status: "active", zoneId: esposterCom.id },
  { parent: esposterCom, protect: true },
);
