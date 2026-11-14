import { esposterCom } from "#src/cloudflare/resources/zones/esposterCom";
import * as cloudflare from "@pulumi/cloudflare";

export const esposterComRedirects: cloudflare.Ruleset = new cloudflare.Ruleset(
  "esposter.com-redirects",
  {
    kind: "zone",
    name: "esposter.com redirects",
    phase: "http_request_dynamic_redirect",
    rules: [
      {
        action: "redirect",
        actionParameters: {
          fromValue: {
            preserveQueryString: true,
            statusCode: 301,
            targetUrl: { expression: 'concat("https://esposter.com", http.request.uri.path)' },
          },
        },
        description: "www to the apex, path and query kept",
        enabled: true,
        expression: 'http.host eq "www.esposter.com"',
      },
    ],
    zoneId: esposterCom.id,
  },
  { parent: esposterCom, protect: true },
);
