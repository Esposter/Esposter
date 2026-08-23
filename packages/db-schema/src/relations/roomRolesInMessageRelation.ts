import { schema } from "#src/schema";
import { defineRelationsPart } from "drizzle-orm";

export const roomRolesInMessageRelation = defineRelationsPart(schema, (r) => ({
  roomRolesInMessage: {
    roomInMessage: r.one.roomsInMessage({
      from: r.roomRolesInMessage.roomId,
      optional: false,
      to: r.roomsInMessage.id,
    }),
    usersToRoomRolesInMessages: r.many.usersToRoomRolesInMessage({
      from: r.roomRolesInMessage.id,
      to: r.usersToRoomRolesInMessage.roleId,
    }),
  },
}));
