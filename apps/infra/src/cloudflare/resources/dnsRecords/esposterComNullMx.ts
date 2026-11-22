import EsposterComDomain from "#src/cloudflare/constants/EsposterComDomain";
import { esposterCom } from "#src/cloudflare/resources/zones/esposterCom";
import * as cloudflare from "@pulumi/cloudflare";

// A null MX (RFC 7505): the domain accepts no mail, so a sender is refused at once rather than retrying. Reviving inbound
// Mail deletes it before Email Routing writes its own MX records
export const esposterComNullMx: cloudflare.DnsRecord = new cloudflare.DnsRecord(
  "esposter.com-null-mx",
  {
    comment: "Null MX: the domain accepts no mail",
    content: ".",
    name: EsposterComDomain,
    priority: 0,
    ttl: 1,
    type: "MX",
    zoneId: esposterCom.id,
  },
  { parent: esposterCom, protect: true },
);
