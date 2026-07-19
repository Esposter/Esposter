import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const threadFollowsInMessageRelation = defineRelationsPart(schema, (r) => ({
  threadFollowsInMessage: {
    room: r.one.roomsInMessage({
      from: r.threadFollowsInMessage.roomId,
      optional: false,
      to: r.roomsInMessage.id,
    }),
    user: r.one.users({
      from: r.threadFollowsInMessage.userId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
