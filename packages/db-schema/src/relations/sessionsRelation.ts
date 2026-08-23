import { schema } from "#src/schema";
import { defineRelationsPart } from "drizzle-orm";

export const sessionsRelation = defineRelationsPart(schema, (r) => ({
  sessions: {
    // Named after the schema key rather than the singular `user` every other table uses: better-auth's
    // Drizzle adapter derives the relation key it joins on from the table key, so a session read only
    // Resolves in one query while this matches `users`
    users: r.one.users({
      from: r.sessions.userId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
