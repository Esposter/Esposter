import { authModelOptions } from "#server/services/auth/authModelOptions";
import { drizzleAdapterConfiguration } from "#server/services/auth/drizzleAdapterConfiguration";
import { MOCK_ENVIRONMENT_VARIABLES } from "#shared/services/environment/constants.test";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { createMockDb } from "@esposter/db-mock";
import { betterAuth } from "better-auth";
import { describe } from "vitest";

// A better-auth instance over the in-memory database, which the session route's suite registers in place of
// `#server/auth`, so the session the route mints is read back by the app's own reader and not by a fake. The secret and
// Base url are the mock environment's, passed in because the module loads before the suite stubs its environment
export const db = await createMockDb();

export const auth = betterAuth({
  ...authModelOptions,
  advanced: { database: { joins: true } },
  baseURL: MOCK_ENVIRONMENT_VARIABLES.BETTER_AUTH_URL,
  database: drizzleAdapter(db, drizzleAdapterConfiguration),
  secret: MOCK_ENVIRONMENT_VARIABLES.BETTER_AUTH_SECRET,
});

describe.todo("devSessionAuth");
