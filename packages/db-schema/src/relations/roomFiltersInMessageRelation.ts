import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const roomFiltersInMessageRelation = defineRelationsPart(schema, (r) => ({
  roomFiltersInMessage: {
    room: r.one.roomsInMessage({
      from: r.roomFiltersInMessage.roomId,
      optional: false,
      to: r.roomsInMessage.id,
    }),
  },
}));
