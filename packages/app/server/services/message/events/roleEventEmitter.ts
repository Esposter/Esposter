import type { Device } from "#shared/models/auth/Device";
import type { RevokeRoleInput } from "#shared/models/db/role/RevokeRoleInput";
import type { RoomRole, User } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

interface RoleEvents {
  assignRole: [[RoomRole & { userId: User["id"] }, Device]];
  createRole: [[RoomRole, Device]];
  deleteRole: [[Pick<RoomRole, "id" | "roomId">, Device]];
  revokeRole: [[RevokeRoleInput, Device]];
  updateRole: [[RoomRole, Device]];
}

export const roleEventEmitter = new EventEmitter<RoleEvents>();
