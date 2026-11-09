import type { Environment } from "#shared/models/environment/Environment";

import { environmentSchema } from "#shared/models/environment/Environment";
import { sharedEnvironmentVariablesShape } from "@esposter/shared";
import { z } from "zod";

// LiveKit is optional — a deployment without it runs calls with no media server — so its three variables may be
// Absent or blank, and `getLiveKitCredentials` reads either as absent
export interface WebEnvironmentVariables {
  APP_ENV: Environment;
  AZURE_CONTAINER_BASE_URL: string;
  AZURE_EVENT_GRID_TOPIC_ENDPOINT: string;
  AZURE_EVENT_GRID_TOPIC_KEY: string;
  AZURE_FUNCTION_BASE_URL: string;
  AZURE_FUNCTION_KEY: string;
  AZURE_SEARCH_API_KEY: string;
  AZURE_SEARCH_BASE_URL: string;
  AZURE_SERVICE_BUS_CONNECTION_STRING: string;
  AZURE_STORAGE_ACCOUNT_CONNECTION_STRING: string;
  AZURE_WEB_PUBSUB_CONNECTION_STRING: string;
  BASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  DATABASE_URL: string;
  FACEBOOK_CLIENT_ID: string;
  FACEBOOK_CLIENT_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  LIVEKIT_API_KEY?: string;
  LIVEKIT_API_SECRET?: string;
  LIVEKIT_URL?: string;
  VAPID_PRIVATE_KEY: string;
  VAPID_PUBLIC_KEY: string;
}

export const webEnvironmentVariablesSchema = z.object({
  ...sharedEnvironmentVariablesShape,
  APP_ENV: environmentSchema,
  AZURE_CONTAINER_BASE_URL: z.url(),
  AZURE_FUNCTION_BASE_URL: z.url(),
  AZURE_FUNCTION_KEY: z.string().min(1),
  AZURE_SEARCH_API_KEY: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.url(),
  FACEBOOK_CLIENT_ID: z.string().min(1),
  FACEBOOK_CLIENT_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  LIVEKIT_API_KEY: z.string().optional(),
  LIVEKIT_API_SECRET: z.string().optional(),
  LIVEKIT_URL: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().min(1),
  VAPID_PUBLIC_KEY: z.string().min(1),
}) satisfies z.ZodType<WebEnvironmentVariables>;
