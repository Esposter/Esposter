import WwwEsposterComHostname from "#src/cloudflare/constants/WwwEsposterComHostname";
import { cloudflareProvider } from "#src/cloudflare/providers/cloudflareProvider";
import { esposterCom } from "#src/cloudflare/resources/zones/esposterCom";
import * as cloudflare from "@pulumi/cloudflare";

// A proxied placeholder, so the redirect ruleset can answer www before any origin does
export const wwwEsposterCom: cloudflare.DnsRecord = new cloudflare.DnsRecord(
  WwwEsposterComHostname,
  {
    comment: "Proxied placeholder; the redirect rule answers it",
    content: "100::",
    name: "www",
    proxied: true,
    ttl: 1,
    type: "AAAA",
    zoneId: esposterCom.id,
  },
  { parent: esposterCom, protect: true, provider: cloudflareProvider },
);
