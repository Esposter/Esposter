import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const moderationNotesInMessageRelation = defineRelationsPart(schema, (r) => ({
  moderationNotesInMessage: {
    actorUser: r.one.usersInAuth({
      from: r.moderationNotesInMessage.actorUserId,
      optional: true,
      to: r.usersInAuth.id,
    }),
    room: r.one.roomsInMessage({ from: r.moderationNotesInMessage.roomId, optional: false, to: r.roomsInMessage.id }),
    targetUser: r.one.usersInAuth({
      from: r.moderationNotesInMessage.targetUserId,
      optional: false,
      to: r.usersInAuth.id,
    }),
  },
}));
