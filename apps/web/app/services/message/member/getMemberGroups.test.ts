import type { PublicUser, RoomRoleInMessage } from "@esposter/db-schema";

import { createRoomRole } from "@/services/message/member/createRoomRole.test";
import { getMemberGroups } from "@/services/message/member/getMemberGroups";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(getMemberGroups, () => {
  const highRole = createRoomRole({ position: 1 });
  const lowRole = createRoomRole({ position: 0 });
  const highRoleMember = { id: v7() };
  const lowRoleMember = { id: v7() };
  const rolelessMember = { id: v7() };
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
      { members: [rolelessMember], role: undefined },
    ]);
  });

  test("keeps member order within a group", () => {
    expect.hasAssertions();

    const secondLowRoleMember: Pick<PublicUser, "id"> = { id: v7() };
    memberRolesMap.set(secondLowRoleMember.id, [lowRole]);
    const memberGroups = getMemberGroups([lowRoleMember, secondLowRoleMember], getMemberRoles);
    memberRolesMap.delete(secondLowRoleMember.id);

    expect(memberGroups).toStrictEqual([{ members: [lowRoleMember, secondLowRoleMember], role: lowRole }]);
  });
});
