import type { schema } from "@esposter/db-schema";
import type { BetterAuthOptions } from "better-auth";

import { selectUserInAuthSchema } from "@esposter/db-schema";

// Better-auth names each model, and its drizzle adapter reads that name as a key of the schema it is handed and as the
// Relation key it joins on. Our keys carry their Postgres schema (`usersInAuth`), so each model is pointed at its
// Export, and a key the registry does not hold fails typecheck. Shared with the adapter's test so its schema check and
// Its join run against the names the app runs with
export const authModelOptions = {
  account: { modelName: "accountsInAuth" satisfies keyof typeof schema },
  session: { modelName: "sessionsInAuth" satisfies keyof typeof schema },
  user: {
    // A provider's profile carries no biography, and better-auth reads the added fields from it before the user is
    // Created, so the field starts empty as its column does rather than refusing a first sign-in with MISSING_FIELD
    additionalFields: {
      biography: {
        defaultValue: "",
        required: true,
        type: "string",
        validator: { input: selectUserInAuthSchema.shape.biography },
      },
    },
    modelName: "usersInAuth" satisfies keyof typeof schema,
  },
  verification: { modelName: "verificationsInAuth" satisfies keyof typeof schema },
} as const satisfies Pick<BetterAuthOptions, "account" | "session" | "user" | "verification">;
