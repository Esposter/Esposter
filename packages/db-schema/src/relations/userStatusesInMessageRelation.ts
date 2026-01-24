import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const userStatusesInMessageRelation = defineRelationsPart(schema, (r) => ({
  userStatusesInMessage: {
    user: r.one.users({
      from: r.userStatusesInMessage.userId,
      to: r.users.id,
    }),
  },
}));
