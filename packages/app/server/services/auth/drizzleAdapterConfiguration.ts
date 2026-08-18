import type { DrizzleAdapterConfig } from "@better-auth/drizzle-adapter/relations-v2";

import { schema } from "@esposter/db-schema";

// Shared with the adapter's test so a join better-auth issues is exercised against the same options the app runs
export const drizzleAdapterConfiguration: DrizzleAdapterConfig = {
  camelCase: true,
  provider: "pg",
  schema,
  usePlural: true,
};
