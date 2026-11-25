import type { Environment } from "#shared/models/environment/Environment";

import { environmentSchema } from "#shared/models/environment/Environment";
import { CloudflareEnvironment } from "@esposter/db-schema";
import { z } from "zod";

// Every variable the web Worker reads. A secret is marked by `.meta({ secret: true })`: a deploy uploads each
// Marked one from Pulumi ESC as a Worker secret, and every other one is a wrangler var nitro.ts writes into its
// Environment's block. `TOPIC_WATCH_SECRET` is required, with no absent form: the web Worker signs each watch with it,
// And the realtime Worker checks each one against it, so the deploy gate refuses a Worker whose secret is empty
export interface WebEnvironmentVariables {
  APP_ENV: Environment;
  BASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  CLOUDFLARE_ENVIRONMENT: CloudflareEnvironment;
  FACEBOOK_CLIENT_ID: string;
  FACEBOOK_CLIENT_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  HYDRATION_CHECK_SECRET: string;
  PUBLIC_ASSETS_BASE_URL: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  TOPIC_WATCH_SECRET: string;
  VAPID_PUBLIC_KEY: string;
}

const secretSchema = z.string().min(1).meta({ secret: true });

export const webEnvironmentVariablesSchema = z.object({
  APP_ENV: environmentSchema,
  BASE_URL: z.url(),
  BETTER_AUTH_SECRET: secretSchema,
  BETTER_AUTH_URL: z.url(),
  CLOUDFLARE_ENVIRONMENT: z.enum(CloudflareEnvironment),
  FACEBOOK_CLIENT_ID: secretSchema,
  FACEBOOK_CLIENT_SECRET: secretSchema,
  GITHUB_CLIENT_ID: secretSchema,
  GITHUB_CLIENT_SECRET: secretSchema,
  GOOGLE_CLIENT_ID: secretSchema,
  GOOGLE_CLIENT_SECRET: secretSchema,
  HYDRATION_CHECK_SECRET: secretSchema,
  PUBLIC_ASSETS_BASE_URL: z.url(),
  R2_ACCESS_KEY_ID: secretSchema,
  R2_SECRET_ACCESS_KEY: secretSchema,
  TOPIC_WATCH_SECRET: secretSchema,
  VAPID_PUBLIC_KEY: secretSchema,
}) satisfies z.ZodType<WebEnvironmentVariables>;
