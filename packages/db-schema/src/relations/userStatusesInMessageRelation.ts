import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const userStatusesInMessageRelation = defineRelationsPart(schema, (r) => ({
  userStatusesInMessage: {
    user: r.one.users({
      fields: [r.userStatusesInMessage.userId],
      references: [r.users.id],
    }),
  },
}));
