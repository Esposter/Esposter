import type { RoomRoleInMessage, User } from "@esposter/db-schema";

import { createRoomRole } from "@/services/message/member/createRoomRole.test";
import { getMemberGroups } from "@/services/message/member/getMemberGroups";
import { describe, expect, test } from "vitest";

describe(getMemberGroups, () => {
  const highRole = createRoomRole({ position: 1 });
  const lowRole = createRoomRole({ position: 0 });
  const highRoleMember = { id: crypto.randomUUID() };
  const lowRoleMember = { id: crypto.randomUUID() };
  const rolelessMember = { id: crypto.randomUUID() };
  const memberRolesMap = new Map<string, RoomRoleInMessage[]>([
    [highRoleMember.id, [lowRole, highRole]],
    [lowRoleMember.id, [lowRole]],
    [rolelessMember.id, []],
  ]);
  const getMemberRoles = (userId: string) => memberRolesMap.get(userId) ?? [];

  test("groups members by top role ordered by position with roleless members last", () => {
    expect.hasAssertions();

    const memberGroups = getMemberGroups([rolelessMember, lowRoleMember, highRoleMember], getMemberRoles);

    expect(memberGroups).toStrictEqual([
      { members: [highRoleMember], role: highRole },
      { members: [lowRoleMember], role: lowRole },
      { members: [rolelessMember], role: null },
    ]);
  });

  test("keeps member order within a group", () => {
    expect.hasAssertions();

    const secondLowRoleMember: Pick<User, "id"> = { id: crypto.randomUUID() };
    memberRolesMap.set(secondLowRoleMember.id, [lowRole]);
    const memberGroups = getMemberGroups([lowRoleMember, secondLowRoleMember], getMemberRoles);
    memberRolesMap.delete(secondLowRoleMember.id);

    expect(memberGroups).toStrictEqual([{ members: [lowRoleMember, secondLowRoleMember], role: lowRole }]);
  });
});
