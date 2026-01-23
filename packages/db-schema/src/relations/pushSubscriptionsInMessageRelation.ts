import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const pushSubscriptionsInMessageRelation = defineRelationsPart(schema, (r) => ({
  pushSubscriptionsInMessage: {
    user: r.one.users({
      from: r.pushSubscriptionsInMessage.userId,
      to: r.users.id,
    }),
  },
}));
