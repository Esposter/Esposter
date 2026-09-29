import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const roomCategoriesInMessageRelation = defineRelationsPart(schema, (r) => ({
  roomCategoriesInMessage: {
    roomsInMessage: r.many.roomsInMessage({ from: r.roomCategoriesInMessage.id, to: r.roomsInMessage.categoryId }),
    user: r.one.usersInAuth({ from: r.roomCategoriesInMessage.userId, optional: false, to: r.usersInAuth.id }),
  },
}));
