import type { WebEnvironmentVariables } from "#shared/models/environment/WebEnvironmentVariables";

import { Environment } from "#shared/models/environment/Environment";
import { TEST_ORIGIN } from "#shared/services/pageBuilder/constants.test";
import { MOCK_BLOB_BASE_URL } from "azure-mock";

// Every variable the schema requires, so a test runs against an environment the start-up check would accept and a
// Variable added to the interface fails here until it is given a value. The optional LiveKit ones are left out, which
// Is a deployment without LiveKit
export const MOCK_ENVIRONMENT_VARIABLES = {
  APP_ENV: Environment.Test,
  AZURE_CONTAINER_BASE_URL: MOCK_BLOB_BASE_URL,
  AZURE_EVENT_GRID_TOPIC_ENDPOINT: TEST_ORIGIN,
  AZURE_EVENT_GRID_TOPIC_KEY: "AZURE_EVENT_GRID_TOPIC_KEY",
  AZURE_FUNCTION_BASE_URL: TEST_ORIGIN,
  AZURE_FUNCTION_KEY: "AZURE_FUNCTION_KEY",
  AZURE_SEARCH_API_KEY: "AZURE_SEARCH_API_KEY",
  AZURE_SEARCH_BASE_URL: TEST_ORIGIN,
  AZURE_SERVICE_BUS_CONNECTION_STRING: "AZURE_SERVICE_BUS_CONNECTION_STRING",
  AZURE_STORAGE_ACCOUNT_CONNECTION_STRING: "AZURE_STORAGE_ACCOUNT_CONNECTION_STRING",
  AZURE_WEB_PUBSUB_CONNECTION_STRING: "AZURE_WEB_PUBSUB_CONNECTION_STRING",
  BASE_URL: TEST_ORIGIN,
  BETTER_AUTH_SECRET: "BETTER_AUTH_SECRET",
  BETTER_AUTH_URL: TEST_ORIGIN,
  DATABASE_URL: TEST_ORIGIN,
  FACEBOOK_CLIENT_ID: "FACEBOOK_CLIENT_ID",
  FACEBOOK_CLIENT_SECRET: "FACEBOOK_CLIENT_SECRET",
  GITHUB_CLIENT_ID: "GITHUB_CLIENT_ID",
  GITHUB_CLIENT_SECRET: "GITHUB_CLIENT_SECRET",
  GOOGLE_CLIENT_ID: "GOOGLE_CLIENT_ID",
  GOOGLE_CLIENT_SECRET: "GOOGLE_CLIENT_SECRET",
  VAPID_PRIVATE_KEY: "VAPID_PRIVATE_KEY",
  VAPID_PUBLIC_KEY: "VAPID_PUBLIC_KEY",
} satisfies WebEnvironmentVariables;
