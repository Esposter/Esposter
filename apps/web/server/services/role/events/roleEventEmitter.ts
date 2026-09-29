import type { Device } from "#shared/models/auth/Device";
import type { RevokeRoleInput } from "#shared/models/db/role/RevokeRoleInput";
import type { RoomRoleInMessage, UserInAuth } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

interface RoleEvents {
  assignRole: [[RoomRoleInMessage & { userId: UserInAuth["id"] }, Device]];
  createRole: [[RoomRoleInMessage, Device]];
  deleteRole: [[Pick<RoomRoleInMessage, "id" | "roomId">, Device]];
  revokeRole: [[RevokeRoleInput, Device]];
  updateRole: [[RoomRoleInMessage, Device]];
}

export const roleEventEmitter = new EventEmitter<RoleEvents>();
