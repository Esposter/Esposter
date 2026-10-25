import type { RoomRoleInMessage } from "#src/schema/message/roomRolesInMessage";
import type { UserToRoomRoleInMessage } from "#src/schema/message/usersToRoomRolesInMessage";

export type UserToRoomRoleInMessageWithRelations = UserToRoomRoleInMessage & { role: RoomRoleInMessage };
