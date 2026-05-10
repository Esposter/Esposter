import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const roomCategoriesInMessageRelation = defineRelationsPart(schema, (r) => ({
  roomCategoriesInMessage: {
    roomsInMessages: r.many.roomsInMessage({
      from: r.roomCategoriesInMessage.id,
      to: r.roomsInMessage.categoryId,
    }),
    user: r.one.users({
      from: r.roomCategoriesInMessage.userId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
