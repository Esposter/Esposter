import { esposterCom } from "#src/cloudflare/resources/zones/esposterCom";
import * as cloudflare from "@pulumi/cloudflare";

// A public object's stable url is `https://assets.<env>.esposter.com/<bucket>/<key>`, and the web Worker serves the public
// Buckets under its `/assets/` route, so each assets host's path is rewritten onto that route before the Worker sees it
const assetsHosts = ["assets.esposter.com", "assets.dev.esposter.com"];

export const esposterComUrlRewrites: cloudflare.Ruleset = new cloudflare.Ruleset(
  "esposter.com-url-rewrites",
  {
    kind: "zone",
    name: "esposter.com url rewrites",
    phase: "http_request_transform",
    rules: assetsHosts.map((host) => ({
      action: "rewrite",
      actionParameters: { uri: { path: { expression: 'concat("/assets", http.request.uri.path)' } } },
      description: `${host} to the web Worker's asset route`,
      enabled: true,
      expression: `http.host eq "${host}"`,
    })),
    zoneId: esposterCom.id,
  },
  { parent: esposterCom, protect: true },
);
