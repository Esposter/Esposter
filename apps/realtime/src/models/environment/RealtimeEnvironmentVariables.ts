import { z } from "zod";

// Every variable this Worker reads. A secret is marked by
// `.meta({ secret: true })`, and a deploy uploads each marked one from
// Pulumi ESC as a Worker secret; every other one is a wrangler var in wrangler.jsonc
// RealtimeKit is optional — a deployment without it runs calls with no media server — so its two variables are `""` when unset.
// An unset secret is `""` too: ESC holds it empty and the deploy uploads that, so it parses to `""`.
// Every reader tests these by truthiness, so `TOPIC_WATCH_SECRET` left empty takes a watch unverified (`checkTopicWatchSigned`)
export interface RealtimeEnvironmentVariables {
  REALTIMEKIT_API_TOKEN: string;
  REALTIMEKIT_APP_ID: string;
  TOPIC_WATCH_SECRET: string;
}

export const realtimeEnvironmentVariablesSchema = z.object({
  REALTIMEKIT_API_TOKEN: z.string().default("").meta({ secret: true }),
  REALTIMEKIT_APP_ID: z.string().default("").meta({ secret: true }),
  TOPIC_WATCH_SECRET: z.string().default("").meta({ secret: true }),
}) satisfies z.ZodType<RealtimeEnvironmentVariables>;
