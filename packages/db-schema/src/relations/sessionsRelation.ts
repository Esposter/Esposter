import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const sessionsRelation = defineRelationsPart(schema, (r) => ({
  sessions: {
    user: r.one.users({
      from: r.sessions.userId,
      to: r.users.id,
    }),
  },
}));
