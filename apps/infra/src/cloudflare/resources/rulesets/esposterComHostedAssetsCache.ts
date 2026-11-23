import { cloudflareProvider } from "#src/cloudflare/providers/cloudflareProvider";
import { esposterCom } from "#src/cloudflare/resources/zones/esposterCom";
import { toRulesSet } from "#src/cloudflare/services/toRulesSet";
import { HostedAssetOriginMap } from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

// The text objects the hosted bucket serves, which the edge does not cache by default: JSON, and the XML of Tiled's
// Tilesets (.tsx) and maps (.tmx)
const HOSTED_TEXT_EXTENSIONS = ["json", "tmx", "tsx", "xml"];
// Both environments' hosted hostnames, which share the zone
const hostedHostnames = Object.values(HostedAssetOriginMap).map((origin) => new URL(origin).hostname);

// The origin's Cache-Control sets how long each object stays, since every hosted object carries max-age=31536000 and
// Immutable, so the rule makes text eligible for the cache and leaves the lifetime to the origin
export const esposterComHostedAssetsCache: cloudflare.Ruleset = new cloudflare.Ruleset(
  "esposter.com-hosted-assets-cache",
  {
    kind: "zone",
    name: "esposter.com hosted assets cache",
    phase: "http_request_cache_settings",
    rules: [
      {
        action: "set_cache_settings",
        actionParameters: { cache: true, edgeTtl: { mode: "respect_origin" } },
        description: "hosted text objects eligible for the edge cache",
        enabled: true,
        expression: `http.host in ${toRulesSet(hostedHostnames)} and http.request.uri.path.extension in ${toRulesSet(HOSTED_TEXT_EXTENSIONS)}`,
      },
    ],
    zoneId: esposterCom.id,
  },
  { parent: esposterCom, protect: true, provider: cloudflareProvider },
);
