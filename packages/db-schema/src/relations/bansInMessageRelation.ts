import { schema } from "#src/schema";
import { defineRelationsPart } from "drizzle-orm";

export const bansInMessageRelation = defineRelationsPart(schema, (r) => ({
  bansInMessage: {
    bannedByUser: r.one.users({
      from: r.bansInMessage.bannedByUserId,
      optional: true,
      to: r.users.id,
    }),
    roomInMessage: r.one.roomsInMessage({
      from: r.bansInMessage.roomId,
      optional: false,
      to: r.roomsInMessage.id,
    }),
    user: r.one.users({
      from: r.bansInMessage.userId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
