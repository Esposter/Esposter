import type { RoomRoleInMessage } from "@esposter/db-schema";

import { checkIsAssignableRole } from "#shared/services/room/rbac/checkIsAssignableRole";

// The member's highest-positioned assigned role — @everyone is implicit and never groups or tints
export const getTopRole = (roles: RoomRoleInMessage[]) => {
  let topRole: RoomRoleInMessage | undefined;
  for (const role of roles) {
    if (!checkIsAssignableRole(role)) continue;
    if (!topRole || role.position > topRole.position) topRole = role;
  }
  return topRole;
};
