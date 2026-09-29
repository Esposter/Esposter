import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const callSessionsInMessageRelation = defineRelationsPart(schema, (r) => ({
  callSessionsInMessage: {
    room: r.one.roomsInMessage({ from: r.callSessionsInMessage.roomId, optional: true, to: r.roomsInMessage.id }),
    user: r.one.usersInAuth({ from: r.callSessionsInMessage.userId, optional: false, to: r.usersInAuth.id }),
  },
}));
