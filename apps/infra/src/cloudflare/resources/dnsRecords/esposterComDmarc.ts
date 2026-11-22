import EsposterComDomain from "#src/cloudflare/constants/EsposterComDomain";
import { esposterCom } from "#src/cloudflare/resources/zones/esposterCom";
import * as cloudflare from "@pulumi/cloudflare";

// A DMARC policy that tells a receiver to reject a message failing SPF and DKIM for the domain, which with no sender
// Authorised is every message claiming it. It stays when inbound mail is revived
export const esposterComDmarc: cloudflare.DnsRecord = new cloudflare.DnsRecord(
  "esposter.com-dmarc",
  {
    comment: "DMARC: reject mail that fails authentication",
    content: '"v=DMARC1; p=reject;"',
    name: `_dmarc.${EsposterComDomain}`,
    ttl: 1,
    type: "TXT",
    zoneId: esposterCom.id,
  },
  { parent: esposterCom, protect: true },
);
