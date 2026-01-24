import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const searchHistoriesInMessageRelation = defineRelationsPart(schema, (r) => ({
  searchHistoriesInMessage: {
    roomInMessage: r.one.roomsInMessage({
      from: r.searchHistoriesInMessage.roomId,
      to: r.roomsInMessage.id,
    }),
    user: r.one.users({
      from: r.searchHistoriesInMessage.userId,
      to: r.users.id,
    }),
  },
}));
