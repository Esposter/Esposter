import type { WebEnvironmentVariables } from "#shared/models/environment/WebEnvironmentVariables";

import { Environment } from "#shared/models/environment/Environment";
import { TEST_ORIGIN } from "#shared/services/pageBuilder/constants.test";
import { CloudflareEnvironment } from "@esposter/db-schema";

// Every variable the schema requires, so a test runs against an environment the start-up check would accept and a
// Variable added to the interface fails here until it is given a value. The optional RealtimeKit ones are left out, which
// Is a deployment without RealtimeKit
export const MOCK_ENVIRONMENT_VARIABLES = {
  APP_ENV: Environment.Test,
  BASE_URL: TEST_ORIGIN,
  BETTER_AUTH_SECRET: "BETTER_AUTH_SECRET",
  BETTER_AUTH_URL: TEST_ORIGIN,
  CLOUDFLARE_ENVIRONMENT: CloudflareEnvironment.Development,
  FACEBOOK_CLIENT_ID: "FACEBOOK_CLIENT_ID",
  FACEBOOK_CLIENT_SECRET: "FACEBOOK_CLIENT_SECRET",
  GITHUB_CLIENT_ID: "GITHUB_CLIENT_ID",
  GITHUB_CLIENT_SECRET: "GITHUB_CLIENT_SECRET",
  GOOGLE_CLIENT_ID: "GOOGLE_CLIENT_ID",
  GOOGLE_CLIENT_SECRET: "GOOGLE_CLIENT_SECRET",
  PUBLIC_ASSETS_BASE_URL: TEST_ORIGIN,
  R2_ACCESS_KEY_ID: "R2_ACCESS_KEY_ID",
  R2_SECRET_ACCESS_KEY: "R2_SECRET_ACCESS_KEY",
  VAPID_PUBLIC_KEY: "VAPID_PUBLIC_KEY",
} satisfies WebEnvironmentVariables;
