import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const callSessionsInMessageRelation = defineRelationsPart(schema, (r) => ({
  callSessionsInMessage: {
    roomInMessage: r.one.roomsInMessage({
      from: r.callSessionsInMessage.roomId,
      to: r.roomsInMessage.id,
    }),
  },
}));
