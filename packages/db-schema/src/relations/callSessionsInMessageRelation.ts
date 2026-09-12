import { schema } from "#src/schema";
import { defineRelationsPart } from "drizzle-orm";

export const callSessionsInMessageRelation = defineRelationsPart(schema, (r) => ({
  callSessionsInMessage: {
    room: r.one.roomsInMessage({
      from: r.callSessionsInMessage.roomId,
      optional: true,
      to: r.roomsInMessage.id,
    }),
    user: r.one.users({
      from: r.callSessionsInMessage.userId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
