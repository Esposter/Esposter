import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const notificationsInNotificationRelation = defineRelationsPart(schema, (r) => ({
  notificationsInNotification: {
    user: r.one.usersInAuth({ from: r.notificationsInNotification.userId, optional: false, to: r.usersInAuth.id }),
  },
}));
