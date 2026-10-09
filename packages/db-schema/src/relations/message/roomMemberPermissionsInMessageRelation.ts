import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const roomMemberPermissionsInMessageRelation = defineRelationsPart(schema, (r) => ({
  roomMemberPermissionsInMessage: {
    room: r.one.roomsInMessage({
      from: r.roomMemberPermissionsInMessage.roomId,
      optional: false,
      to: r.roomsInMessage.id,
    }),
  },
}));
