import { sharedEnvironmentVariablesShape } from "@esposter/shared";
import { z } from "zod";

export interface FunctionsEnvironmentVariables {
  AZURE_SEARCH_BASE_URL: string;
  AZURE_STORAGE_ACCOUNT_CONNECTION_STRING: string;
  BASE_URL: string;
  DATABASE_URL: string;
  VAPID_PRIVATE_KEY: string;
  VAPID_PUBLIC_KEY: string;
}

// Every variable this app declares is one the web app declares with the same validator, so the schema is the shared shape
export const functionsEnvironmentVariablesSchema = z.object(
  sharedEnvironmentVariablesShape,
) satisfies z.ZodType<FunctionsEnvironmentVariables>;
