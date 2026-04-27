import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const appUsersInMessageRelation = defineRelationsPart(schema, (r) => ({
  appUsersInMessage: {
    webhooksInMessages: r.many.webhooksInMessage({
      from: r.appUsersInMessage.id,
      to: r.webhooksInMessage.userId,
    }),
  },
}));
