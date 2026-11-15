import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const invitesInMessageRelation = defineRelationsPart(schema, (r) => ({
  invitesInMessage: {
    room: r.one.roomsInMessage({ from: r.invitesInMessage.roomId, optional: false, to: r.roomsInMessage.id }),
    user: r.one.usersInAuth({ from: r.invitesInMessage.userId, optional: false, to: r.usersInAuth.id }),
  },
}));
