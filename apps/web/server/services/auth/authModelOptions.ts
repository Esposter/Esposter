import type { schema } from "@esposter/db-schema";
import type { BetterAuthOptions } from "better-auth";

type SchemaKey = keyof typeof schema;
// Better-auth names each model, and its drizzle adapter reads that name as a key of the schema it is handed and as the
// Relation key it joins on. Our keys carry their Postgres schema (`usersInAuth`), so each model is pointed at its export,
// And a key the registry does not hold fails typecheck. Shared with the adapter's test so its schema check and its join
// Run against the names the app runs with
export const authModelOptions = {
  account: { modelName: "accountsInAuth" satisfies SchemaKey },
  session: { modelName: "sessionsInAuth" satisfies SchemaKey },
  user: { modelName: "usersInAuth" satisfies SchemaKey },
  verification: { modelName: "verificationsInAuth" satisfies SchemaKey },
} as const satisfies Pick<BetterAuthOptions, "account" | "session" | "user" | "verification">;
