import { schema } from "#src/schema";
import { defineRelationsPart } from "drizzle-orm";

export const usersToRoomRolesInMessageRelation = defineRelationsPart(schema, (r) => ({
  usersToRoomRolesInMessage: {
    role: r.one.roomRolesInMessage({
      from: r.usersToRoomRolesInMessage.roleId,
      optional: false,
      to: r.roomRolesInMessage.id,
    }),
    roomInMessage: r.one.roomsInMessage({
      from: r.usersToRoomRolesInMessage.roomId,
      optional: false,
      to: r.roomsInMessage.id,
    }),
    user: r.one.users({
      from: r.usersToRoomRolesInMessage.userId,
      optional: false,
      to: r.users.id,
    }),
  },
}));

export const UserToRoomRoleInMessageRelations = {
  role: true,
} as const;
