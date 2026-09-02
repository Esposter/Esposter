import type { RoomRoleInMessage } from "@esposter/db-schema";

// Count of members whose top (highest-positioned, non-@everyone) role is roleId; the roleless
// Trailing group is derived client-side as the total member count minus every role-grouped member
export interface MemberCountByTopRole {
  count: number;
  roleId: RoomRoleInMessage["id"];
}
