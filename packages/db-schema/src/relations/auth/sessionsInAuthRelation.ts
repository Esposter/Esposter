import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const sessionsInAuthRelation = defineRelationsPart(schema, (r) => ({
  sessionsInAuth: {
    // Named after the schema key rather than the singular `user` every other table uses: better-auth's
    // Drizzle adapter derives the relation key it joins on from the model name, which is the schema key, so a
    // Session read only resolves in one query while this matches `usersInAuth`
    usersInAuth: r.one.usersInAuth({ from: r.sessionsInAuth.userId, optional: false, to: r.usersInAuth.id }),
  },
}));
