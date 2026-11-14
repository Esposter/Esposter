import { esposterCom } from "#src/cloudflare/resources/zones/esposterCom";
import * as cloudflare from "@pulumi/cloudflare";

// A proxied placeholder, so the redirect ruleset can answer www before any origin does
export const esposterComWww: cloudflare.DnsRecord = new cloudflare.DnsRecord(
  "www.esposter.com",
  {
    comment: "Proxied placeholder; the redirect rule answers it",
    content: "100::",
    name: "www",
    proxied: true,
    ttl: 1,
    type: "AAAA",
    zoneId: esposterCom.id,
  },
  { parent: esposterCom, protect: true },
);
