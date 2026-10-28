import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const usersToRoomRolesInMessageRelation = defineRelationsPart(schema, (r) => ({
  usersToRoomRolesInMessage: {
    role: r.one.roomRolesInMessage({
      from: r.usersToRoomRolesInMessage.roleId,
      optional: false,
      to: r.roomRolesInMessage.id,
    }),
    room: r.one.roomsInMessage({ from: r.usersToRoomRolesInMessage.roomId, optional: false, to: r.roomsInMessage.id }),
    user: r.one.usersInAuth({ from: r.usersToRoomRolesInMessage.userId, optional: false, to: r.usersInAuth.id }),
  },
}));

// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const UserToRoomRoleInMessageRelations = { role: true } as const;
