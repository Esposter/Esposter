import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const userStatusesInMessageRelation = defineRelationsPart(schema, (r) => ({
  userStatusesInMessage: {
    user: r.one.usersInAuth({ from: r.userStatusesInMessage.userId, optional: false, to: r.usersInAuth.id }),
  },
}));
