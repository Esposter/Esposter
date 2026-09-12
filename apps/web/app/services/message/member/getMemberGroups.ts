import type { MemberGroup } from "@/models/message/member/MemberGroup";
import type { RoomRoleInMessage, User } from "@esposter/db-schema";

import { getTopRole } from "@/services/message/member/getTopRole";
import { getOrCreate } from "@esposter/shared";

// Discord-style member grouping — one group per top role ordered by position (highest first).
// Members without any role trail in a single roleless group.
export const getMemberGroups = <TMember extends Pick<User, "id">>(
  members: TMember[],
  getMemberRoles: (userId: string) => RoomRoleInMessage[],
): MemberGroup<TMember>[] => {
  const roleIdGroupMap = new Map<string, MemberGroup<TMember>>();
  for (const member of members) {
    const role = getTopRole(getMemberRoles(member.id));
    const roleId = role?.id ?? "";
    getOrCreate(roleIdGroupMap, roleId, () => ({ members: [], role })).members.push(member);
  }
  return [...roleIdGroupMap.values()].toSorted((firstGroup, secondGroup) => {
    if (!firstGroup.role) return 1;
    else if (secondGroup.role) return secondGroup.role.position - firstGroup.role.position;
    else return -1;
  });
};
