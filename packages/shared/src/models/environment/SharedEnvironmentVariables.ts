import { z } from "zod";

// The variables the web app and the Functions app both declare, with the one validator each
// An app's schema spreads this shape rather than writing the rule again, so a shared variable's rule changes in one place
export const sharedEnvironmentVariablesShape: {
  AZURE_EVENT_GRID_TOPIC_ENDPOINT: z.ZodURL;
  AZURE_EVENT_GRID_TOPIC_KEY: z.ZodString;
  AZURE_SEARCH_BASE_URL: z.ZodURL;
  AZURE_SERVICE_BUS_CONNECTION_STRING: z.ZodString;
  AZURE_STORAGE_ACCOUNT_CONNECTION_STRING: z.ZodString;
  AZURE_WEB_PUBSUB_CONNECTION_STRING: z.ZodString;
  BASE_URL: z.ZodURL;
  DATABASE_URL: z.ZodURL;
  VAPID_PRIVATE_KEY: z.ZodString;
  VAPID_PUBLIC_KEY: z.ZodString;
} = {
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
};
