import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const searchHistoriesInMessageRelation = defineRelationsPart(schema, (r) => ({
  searchHistoriesInMessage: {
    room: r.one.roomsInMessage({ from: r.searchHistoriesInMessage.roomId, optional: false, to: r.roomsInMessage.id }),
    user: r.one.usersInAuth({ from: r.searchHistoriesInMessage.userId, optional: false, to: r.usersInAuth.id }),
  },
}));
