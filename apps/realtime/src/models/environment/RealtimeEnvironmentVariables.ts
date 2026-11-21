import { z } from "zod";

// Every variable this Worker reads. A secret is marked by
// `.meta({ secret: true })`, and a deploy uploads each marked one from
// Pulumi ESC as a Worker secret; every other one is a wrangler var in wrangler.jsonc
// RealtimeKit is optional — a deployment without it runs calls with no media server — so its two variables are `""` when unset.
// An unset optional secret is `""` too: ESC holds it empty and the deploy uploads that, so it parses to `""`.
// `TOPIC_WATCH_SECRET` is required, with no absent form: every watch is checked against it (`checkTopicWatchSigned`)
export interface RealtimeEnvironmentVariables {
  REALTIMEKIT_API_TOKEN: string;
  REALTIMEKIT_APP_ID: string;
  TOPIC_WATCH_SECRET: string;
}

export const realtimeEnvironmentVariablesSchema = z.object({
  REALTIMEKIT_API_TOKEN: z.string().default("").meta({ secret: true }),
  REALTIMEKIT_APP_ID: z.string().default("").meta({ secret: true }),
  TOPIC_WATCH_SECRET: z.string().min(1).meta({ secret: true }),
}) satisfies z.ZodType<RealtimeEnvironmentVariables>;
