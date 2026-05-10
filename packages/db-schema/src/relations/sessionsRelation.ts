import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const sessionsRelation = defineRelationsPart(schema, (r) => ({
  sessions: {
    user: r.one.users({
      from: r.sessions.userId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
