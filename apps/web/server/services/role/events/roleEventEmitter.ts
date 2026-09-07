import type { Device } from "#shared/models/auth/Device";
import type { RevokeRoleInput } from "#shared/models/db/role/RevokeRoleInput";
import type { RoomRoleInMessage, User } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

interface RoleEvents {
  assignRole: [[RoomRoleInMessage & { userId: User["id"] }, Device]];
  createRole: [[RoomRoleInMessage, Device]];
  deleteRole: [[Pick<RoomRoleInMessage, "id" | "roomId">, Device]];
  revokeRole: [[RevokeRoleInput, Device]];
  updateRole: [[RoomRoleInMessage, Device]];
}

export const roleEventEmitter = new EventEmitter<RoleEvents>();
