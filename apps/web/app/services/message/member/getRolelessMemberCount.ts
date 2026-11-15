import type { MemberCountByTopRole } from "#shared/models/db/room/MemberCountByTopRole";

// The roleless group is never read on its own: the total less every role group, so a join or leave that re-reads the
// Total and the role counts keeps it current. It is unknown for as long as the total is unknown
export const getRolelessMemberCount = (
  memberCount: number | undefined,
  memberCountsByTopRole: MemberCountByTopRole[],
) =>
  memberCount === undefined
    ? undefined
    : memberCount - memberCountsByTopRole.reduce((sum, { count }) => sum + count, 0);
