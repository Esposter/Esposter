import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const moderationLogsInMessageRelation = defineRelationsPart(schema, (r) => ({
  moderationLogsInMessage: {
    room: r.one.roomsInMessage({ from: r.moderationLogsInMessage.roomId, optional: false, to: r.roomsInMessage.id }),
    targetUser: r.one.usersInAuth({
      from: r.moderationLogsInMessage.targetUserId,
      optional: false,
      to: r.usersInAuth.id,
    }),
  },
}));
