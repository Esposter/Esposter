import type { RoomRoleInMessage } from "@esposter/db-schema";

// A role's permission bitfield is a bigint, which a role event carries as its decimal digits
export const getRoleEventData = (role: RoomRoleInMessage) => ({ ...role, permissions: role.permissions.toString() });
