import type { Environment } from "#shared/models/environment/Environment";

import { environmentSchema } from "#shared/models/environment/Environment";
import { CloudflareEnvironment } from "@esposter/db-schema";
import { z } from "zod";

// Every variable the web Worker reads. A secret is marked by `.meta({ secret: true })`: a deploy uploads each marked one
// from Pulumi ESC as a Worker secret, and every other one is a wrangler var nitro.ts writes into its environment's block.
// RealtimeKit is optional — a deployment without it runs calls with no media server — so its three variables may be Absent
export interface WebEnvironmentVariables {
  APP_ENV: Environment;
  BASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_ENVIRONMENT: CloudflareEnvironment;
  FACEBOOK_CLIENT_ID: string;
  FACEBOOK_CLIENT_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  PUBLIC_ASSETS_BASE_URL: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  REALTIMEKIT_API_TOKEN?: string;
  REALTIMEKIT_APP_ID?: string;
  REALTIMEKIT_WEBHOOK_SIGNING_KEY?: string;
  VAPID_PUBLIC_KEY: string;
}

export const webEnvironmentVariablesSchema = z.object({
  APP_ENV: environmentSchema,
  BASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(1).meta({ secret: true }),
  BETTER_AUTH_URL: z.url(),
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
  CLOUDFLARE_ENVIRONMENT: z.enum(CloudflareEnvironment),
  FACEBOOK_CLIENT_ID: z.string().min(1).meta({ secret: true }),
  FACEBOOK_CLIENT_SECRET: z.string().min(1).meta({ secret: true }),
  GITHUB_CLIENT_ID: z.string().min(1).meta({ secret: true }),
  GITHUB_CLIENT_SECRET: z.string().min(1).meta({ secret: true }),
  GOOGLE_CLIENT_ID: z.string().min(1).meta({ secret: true }),
  GOOGLE_CLIENT_SECRET: z.string().min(1).meta({ secret: true }),
  PUBLIC_ASSETS_BASE_URL: z.url(),
  R2_ACCESS_KEY_ID: z.string().min(1).meta({ secret: true }),
  R2_SECRET_ACCESS_KEY: z.string().min(1).meta({ secret: true }),
  REALTIMEKIT_API_TOKEN: z.string().min(1).optional().meta({ secret: true }),
  REALTIMEKIT_APP_ID: z.string().min(1).optional().meta({ secret: true }),
  REALTIMEKIT_WEBHOOK_SIGNING_KEY: z.string().min(1).optional().meta({ secret: true }),
  VAPID_PUBLIC_KEY: z.string().min(1).meta({ secret: true }),
}) satisfies z.ZodType<WebEnvironmentVariables>;
