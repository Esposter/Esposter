import type { RoomRoleInMessage, User } from "@esposter/db-schema";

import { getTopRole } from "@/services/message/member/getTopRole";

// Discord-style member grouping — one group per top role ordered by position (highest first).
// Members without any role trail in a single roleless group.
export const getMemberGroups = <TMember extends Pick<User, "id">>(
  members: TMember[],
  getMemberRoles: (userId: string) => RoomRoleInMessage[],
): { members: TMember[]; role?: RoomRoleInMessage }[] => {
  const roleIdGroupMap = new Map<string, { members: TMember[]; role?: RoomRoleInMessage }>();
  for (const member of members) {
    const role = getTopRole(getMemberRoles(member.id));
    const roleId = role?.id ?? "";
    const group = roleIdGroupMap.get(roleId) ?? { members: [], role };
    group.members.push(member);
    roleIdGroupMap.set(roleId, group);
  }
  return [...roleIdGroupMap.values()].toSorted((a, b) => {
    if (!a.role) return 1;
    else if (!b.role) return -1;
    return b.role.position - a.role.position;
  });
};
