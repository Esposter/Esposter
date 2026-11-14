import { CloudflareEnvironment } from "@esposter/db-schema";
import { z } from "zod";

// Every variable this Worker reads. A secret is marked by `.meta({ secret: true })`, and a deploy uploads each marked one
// from Pulumi ESC as a Worker secret; every other one is a wrangler var in wrangler.jsonc
// RealtimeKit is optional — a deployment without it runs calls with no media server — so its variables may be absent
export interface FunctionsEnvironmentVariables {
  BASE_URL: string;
  // The environment this Worker runs in, which names its queues: the dispatcher finds a batch's job by it
  CLOUDFLARE_ENVIRONMENT: CloudflareEnvironment;
  REALTIMEKIT_API_TOKEN?: string;
  REALTIMEKIT_APP_ID?: string;
  VAPID_PRIVATE_KEY: string;
  VAPID_PUBLIC_KEY: string;
}

export const functionsEnvironmentVariablesSchema = z.object({
  BASE_URL: z.url(),
  CLOUDFLARE_ENVIRONMENT: z.enum(CloudflareEnvironment),
  REALTIMEKIT_API_TOKEN: z.string().min(1).optional().meta({ secret: true }),
  REALTIMEKIT_APP_ID: z.string().min(1).optional().meta({ secret: true }),
  VAPID_PRIVATE_KEY: z.string().min(1).meta({ secret: true }),
  VAPID_PUBLIC_KEY: z.string().min(1).meta({ secret: true }),
}) satisfies z.ZodType<FunctionsEnvironmentVariables>;
