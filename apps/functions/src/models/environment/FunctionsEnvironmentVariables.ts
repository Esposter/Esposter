import { CloudflareEnvironment } from "@esposter/db-schema";
import { sharedEnvironmentVariablesShape } from "@esposter/shared";
import { z } from "zod";

export interface FunctionsEnvironmentVariables {
  AZURE_SEARCH_BASE_URL: string;
  AZURE_STORAGE_ACCOUNT_CONNECTION_STRING: string;
  BASE_URL: string;
  // The environment this Worker runs in, which names its queues: the dispatcher finds a batch's job by it
  CLOUDFLARE_ENVIRONMENT: CloudflareEnvironment;
  DATABASE_URL: string;
  VAPID_PRIVATE_KEY: string;
  VAPID_PUBLIC_KEY: string;
}

// Every variable this app declares is one the web app declares with the same validator, so the schema is the shared shape
// plus the one this Worker alone reads
export const functionsEnvironmentVariablesSchema = z.object({
  ...sharedEnvironmentVariablesShape,
  CLOUDFLARE_ENVIRONMENT: z.enum(CloudflareEnvironment),
}) satisfies z.ZodType<FunctionsEnvironmentVariables>;
