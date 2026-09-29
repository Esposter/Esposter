import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const scheduledMessageJobsInMessageRelation = defineRelationsPart(schema, (r) => ({
  scheduledMessageJobsInMessage: {
    room: r.one.roomsInMessage({
      from: r.scheduledMessageJobsInMessage.roomId,
      optional: false,
      to: r.roomsInMessage.id,
    }),
    user: r.one.usersInAuth({ from: r.scheduledMessageJobsInMessage.userId, optional: false, to: r.usersInAuth.id }),
  },
}));
