import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const pushSubscriptionsInNotificationRelation = defineRelationsPart(schema, (r) => ({
  pushSubscriptionsInNotification: {
    user: r.one.usersInAuth({ from: r.pushSubscriptionsInNotification.userId, optional: false, to: r.usersInAuth.id }),
  },
}));
