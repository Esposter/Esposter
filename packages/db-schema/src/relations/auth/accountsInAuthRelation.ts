import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const accountsInAuthRelation = defineRelationsPart(schema, (r) => ({
  accountsInAuth: {
    // Named after the schema key for the same reason as `sessionsInAuth.usersInAuth` — better-auth joins on it
    usersInAuth: r.one.usersInAuth({ from: r.accountsInAuth.userId, optional: false, to: r.usersInAuth.id }),
  },
}));
