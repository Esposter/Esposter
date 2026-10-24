import type { MemberCountByTopRole } from "#shared/models/db/room/MemberCountByTopRole";
import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";
import type { MemberGroup } from "@/models/message/member/MemberGroup";
import type { UiListItem } from "@/models/ui/UiListItem";

import { getMemberDescription } from "@/services/message/member/getMemberDescription";
import { getMemberGroupTitle } from "@/services/message/member/getMemberGroupTitle";
import { getRolelessMemberCount } from "@/services/message/member/getRolelessMemberCount";

// Discord's member list: one row per member under the heading of the group they are in, headed by its role and how many
// Hold it
export const getMemberListItems = (
  memberGroups: MemberGroup<MemberInRoom>[],
  memberCount: number,
  memberCountsByTopRole: MemberCountByTopRole[],
  getStatusMessage: (userId: string) => string,
) => {
  const roleIdMemberCountMap = new Map(memberCountsByTopRole.map(({ count, roleId }) => [roleId, count]));
  const rolelessMemberCount = getRolelessMemberCount(memberCount, memberCountsByTopRole);
  return memberGroups.flatMap(({ members, role }) => {
    const group = getMemberGroupTitle(role, role ? roleIdMemberCountMap.get(role.id) : rolelessMemberCount);
    return members.map<UiListItem<string>>((member) => ({
      description: getMemberDescription(member, getStatusMessage(member.id)),
      group,
      hasMarkSlot: true,
      title: member.displayName,
      value: member.id,
    }));
  });
};
