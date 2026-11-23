import EsposterComDomain from "#src/cloudflare/constants/EsposterComDomain";
import { cloudflareProvider } from "#src/cloudflare/providers/cloudflareProvider";
import { esposterCom } from "#src/cloudflare/resources/zones/esposterCom";
import * as cloudflare from "@pulumi/cloudflare";

/** An SPF policy that authorises no sender, so a message claiming to come from the domain fails it. The content is
 * quoted, as the DNS API stores a TXT record's content / */
export const esposterComSpf: cloudflare.DnsRecord = new cloudflare.DnsRecord(
  "esposter.com-spf",
  {
    comment: "SPF: no host sends mail for the domain",
    content: '"v=spf1 -all"',
    name: EsposterComDomain,
    ttl: 1,
    type: "TXT",
    zoneId: esposterCom.id,
  },
  { parent: esposterCom, protect: true, provider: cloudflareProvider },
);
