import { schema } from "#src/schema";
import { defineRelationsPart } from "drizzle-orm";

export const pushSubscriptionsRelation = defineRelationsPart(schema, (r) => ({
  pushSubscriptions: {
    user: r.one.users({
      from: r.pushSubscriptions.userId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
