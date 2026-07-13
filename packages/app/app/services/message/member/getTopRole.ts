import type { RoomRoleInMessage } from "@esposter/db-schema";

// The member's highest-positioned assigned role — @everyone is implicit and never groups or tints
export const getTopRole = (roles: RoomRoleInMessage[]): null | RoomRoleInMessage => {
  let topRole: null | RoomRoleInMessage = null;
  for (const role of roles) {
    if (role.isEveryone) continue;
    if (!topRole || role.position > topRole.position) topRole = role;
  }
  return topRole;
};
