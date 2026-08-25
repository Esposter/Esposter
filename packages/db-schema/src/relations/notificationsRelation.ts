import { schema } from "#src/schema";
import { defineRelationsPart } from "drizzle-orm";

export const notificationsRelation = defineRelationsPart(schema, (r) => ({
  notifications: {
    user: r.one.users({
      from: r.notifications.userId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
