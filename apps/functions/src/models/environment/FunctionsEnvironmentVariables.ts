import { CloudflareEnvironment } from "@esposter/db-schema";
import { z } from "zod";

// Every variable this Worker reads. A secret is marked by `.meta({ secret: true })`, and a deploy uploads each marked one
// from Pulumi ESC as a Worker secret; every other one is a wrangler var in wrangler.jsonc
export interface FunctionsEnvironmentVariables {
  BASE_URL: string;
  // The environment this Worker runs in, which names its queues: the dispatcher finds a batch's job by it
  CLOUDFLARE_ENVIRONMENT: CloudflareEnvironment;
  VAPID_PRIVATE_KEY: string;
  VAPID_PUBLIC_KEY: string;
}

export const functionsEnvironmentVariablesSchema = z.object({
  BASE_URL: z.url(),
  CLOUDFLARE_ENVIRONMENT: z.enum(CloudflareEnvironment),
  VAPID_PRIVATE_KEY: z.string().min(1).meta({ secret: true }),
  VAPID_PUBLIC_KEY: z.string().min(1).meta({ secret: true }),
}) satisfies z.ZodType<FunctionsEnvironmentVariables>;
