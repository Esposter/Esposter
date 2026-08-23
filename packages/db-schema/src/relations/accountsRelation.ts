import { schema } from "#src/schema";
import { defineRelationsPart } from "drizzle-orm";

export const accountsRelation = defineRelationsPart(schema, (r) => ({
  accounts: {
    // Named after the schema key for the same reason as `sessions.users` — better-auth joins on the table key
    users: r.one.users({
      from: r.accounts.userId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
