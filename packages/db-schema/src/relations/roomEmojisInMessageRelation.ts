import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const roomEmojisInMessageRelation = defineRelationsPart(schema, (r) => ({
  roomEmojisInMessage: {
    room: r.one.roomsInMessage({
      from: r.roomEmojisInMessage.roomId,
      optional: false,
      to: r.roomsInMessage.id,
    }),
  },
}));
