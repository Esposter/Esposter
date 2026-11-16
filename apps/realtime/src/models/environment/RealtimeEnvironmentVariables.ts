import { z } from "zod";

// Every variable this Worker reads. A secret is marked by
// `.meta({ secret: true })`, and a deploy uploads each marked one from
// Pulumi ESC as a Worker secret; every other one is a wrangler var in wrangler.jsonc
// RealtimeKit is optional — a deployment without it runs calls with no media server — so its variables may be absent
export interface RealtimeEnvironmentVariables {
  REALTIMEKIT_API_TOKEN?: string | undefined;
  REALTIMEKIT_APP_ID?: string | undefined;
}

export const realtimeEnvironmentVariablesSchema = z.object({
  REALTIMEKIT_API_TOKEN: z.string().min(1).optional().meta({ secret: true }),
  REALTIMEKIT_APP_ID: z.string().min(1).optional().meta({ secret: true }),
}) satisfies z.ZodType<RealtimeEnvironmentVariables>;
