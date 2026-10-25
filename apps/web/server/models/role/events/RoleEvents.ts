import type { MemberPermissionOverrideEvent } from "#server/models/role/MemberPermissionOverrideEvent";
import type { Device } from "#shared/models/auth/Device";
import type { RevokeRoleInput } from "#shared/models/db/role/RevokeRoleInput";
import type { RoomRoleInMessage, UserInAuth } from "@esposter/db-schema";

export interface RoleEvents {
  assignRole: [[RoomRoleInMessage & { userId: UserInAuth["id"] }, Device]];
  createRole: [[RoomRoleInMessage, Device]];
  deleteRole: [[Pick<RoomRoleInMessage, "id" | "roomId">, Device]];
  revokeRole: [[RevokeRoleInput, Device]];
  updateMemberPermissionOverride: [[MemberPermissionOverrideEvent, Device]];
  updateRole: [[RoomRoleInMessage, Device]];
}
