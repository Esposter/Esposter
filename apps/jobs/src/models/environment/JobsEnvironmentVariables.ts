import { CloudflareEnvironment } from "@esposter/db-schema";
import { z } from "zod";

// Every variable this Worker reads. A secret is marked by
// `.meta({ secret: true })`, and a deploy uploads each marked one from
// Pulumi ESC as a Worker secret; every other one is a wrangler var in wrangler.jsonc
export interface JobsEnvironmentVariables {
  BASE_URL: string;
  // The environment this Worker runs in, which names its queues: the dispatcher finds a batch's job by it
  CLOUDFLARE_ENVIRONMENT: CloudflareEnvironment;
  // The cutover routes' shared secret, deleted with them at teardown
  CUTOVER_SECRET: string;
  VAPID_PRIVATE_KEY: string;
  VAPID_PUBLIC_KEY: string;
}

export const jobsEnvironmentVariablesSchema = z.object({
  BASE_URL: z.url(),
  CLOUDFLARE_ENVIRONMENT: z.enum(CloudflareEnvironment),
  CUTOVER_SECRET: z.string().min(1).meta({ secret: true }),
  VAPID_PRIVATE_KEY: z.string().min(1).meta({ secret: true }),
  VAPID_PUBLIC_KEY: z.string().min(1).meta({ secret: true }),
}) satisfies z.ZodType<JobsEnvironmentVariables>;
