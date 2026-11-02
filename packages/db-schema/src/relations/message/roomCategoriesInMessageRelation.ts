import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const roomCategoriesInMessageRelation = defineRelationsPart(schema, (r) => ({
  roomCategoriesInMessage: {
    user: r.one.usersInAuth({ from: r.roomCategoriesInMessage.userId, optional: false, to: r.usersInAuth.id }),
    usersToRoomsInMessage: r.many.usersToRoomsInMessage({
      from: r.roomCategoriesInMessage.id,
      to: r.usersToRoomsInMessage.categoryId,
    }),
  },
}));
