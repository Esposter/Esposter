import { esposterCom } from "#src/cloudflare/resources/zones/esposterCom";
import * as cloudflare from "@pulumi/cloudflare";

// Railway until the cutover switches the apex to the web Worker
export const esposterComApex: cloudflare.DnsRecord = new cloudflare.DnsRecord(
  "esposter.com-apex",
  {
    comment: "Railway until the cutover switches the apex to the web Worker",
    content: "esposter-production.up.railway.app",
    name: "esposter.com",
    proxied: false,
    ttl: 60,
    type: "CNAME",
    zoneId: esposterCom.id,
  },
  { parent: esposterCom, protect: true },
);
