import type * as pulumi from "@pulumi/pulumi";

import { tokEsposterBackfill } from "#src/cloudflare/resources/accountTokens/tokEsposterBackfill";

// The backfill's D1 token, which ESC holds under the backfill key the backfills skill's run names, and a run loads as
// The Token drizzle-kit reads
export const backfillApiToken: pulumi.Output<string> = tokEsposterBackfill.value;
