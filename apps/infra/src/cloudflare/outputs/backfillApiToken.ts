import type * as pulumi from "@pulumi/pulumi";

import { tokEsposterBackfill } from "#src/cloudflare/resources/accountTokens/tokEsposterBackfill";

// The backfill's D1 token, which ESC holds as `CLOUDFLARE_BACKFILL_API_TOKEN` and a run loads as `CLOUDFLARE_API_TOKEN`
export const backfillApiToken: pulumi.Output<string> = tokEsposterBackfill.value;
