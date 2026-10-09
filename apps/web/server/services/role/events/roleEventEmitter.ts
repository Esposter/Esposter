import type { Device } from "#shared/models/auth/Device";
import type { MemberPermissionOverride } from "#shared/models/db/role/MemberPermissionOverride";
import type { RevokeRoleInput } from "#shared/models/db/role/RevokeRoleInput";
import type { RoomRoleInMessage, UserInAuth } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

// The state a member is left in, which is what a client applies: both zero means the roles decide alone
interface MemberPermissionOverrideEvent extends MemberPermissionOverride {
  roomId: string;
  userId: UserInAuth["id"];
}

interface RoleEvents {
  assignRole: [[RoomRoleInMessage & { userId: UserInAuth["id"] }, Device]];
  createRole: [[RoomRoleInMessage, Device]];
  deleteRole: [[Pick<RoomRoleInMessage, "id" | "roomId">, Device]];
  revokeRole: [[RevokeRoleInput, Device]];
  updateMemberPermissionOverride: [[MemberPermissionOverrideEvent, Device]];
  updateRole: [[RoomRoleInMessage, Device]];
}

export const roleEventEmitter = new EventEmitter<RoleEvents>();
