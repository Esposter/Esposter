import { z } from "zod";

export interface FunctionsEnvironmentVariables {
  AZURE_EVENT_GRID_TOPIC_ENDPOINT: string;
  AZURE_EVENT_GRID_TOPIC_KEY: string;
  AZURE_SEARCH_BASE_URL: string;
  AZURE_SERVICE_BUS_CONNECTION_STRING: string;
  AZURE_STORAGE_ACCOUNT_CONNECTION_STRING: string;
  AZURE_WEB_PUBSUB_CONNECTION_STRING: string;
  BASE_URL: string;
  DATABASE_URL: string;
  VAPID_PRIVATE_KEY: string;
  VAPID_PUBLIC_KEY: string;
}

// The variables the other app also declares, written twice on purpose, so the duplicate-code gate skips the schema
// `jscpd:ignore-start`
export const functionsEnvironmentVariablesSchema = z.object({
  AZURE_EVENT_GRID_TOPIC_ENDPOINT: z.url(),
  AZURE_EVENT_GRID_TOPIC_KEY: z.string().min(1),
  AZURE_SEARCH_BASE_URL: z.url(),
  AZURE_SERVICE_BUS_CONNECTION_STRING: z.string().min(1),
  AZURE_STORAGE_ACCOUNT_CONNECTION_STRING: z.string().min(1),
  AZURE_WEB_PUBSUB_CONNECTION_STRING: z.string().min(1),
  BASE_URL: z.url(),
  DATABASE_URL: z.url(),
  VAPID_PRIVATE_KEY: z.string().min(1),
  VAPID_PUBLIC_KEY: z.string().min(1),
}) satisfies z.ZodType<FunctionsEnvironmentVariables>;
// `jscpd:ignore-end`
