import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";

import { createRoomRole } from "@/services/message/member/createRoomRole.test";
import { getMemberListItems } from "@/services/message/member/getMemberListItems";
import { createUser } from "@/services/message/user/createUser.test";
import { describe, expect, test } from "vitest";

describe(getMemberListItems, () => {
  const role = createRoomRole({ name: "Mod", position: 1 });
  const roleMember: MemberInRoom = { ...createUser({ name: "Alice" }), displayName: "Ally" };
  const rolelessMember: MemberInRoom = { ...createUser({ name: "Bob" }), displayName: "Bob" };

  test("heads each group with its role and count, counting the roleless group as the total less the role groups", () => {
    expect.hasAssertions();

    const memberItems = getMemberListItems(
      [{ members: [roleMember], role }, { members: [rolelessMember] }],
      5,
      [{ count: 3, roleId: role.id }],
      () => "",
    );

    expect(memberItems.map(({ group }) => group)).toStrictEqual(["Mod — 3", "Members — 2"]);
  });

  test("describes each row with its status message", () => {
    expect.hasAssertions();

    const memberItems = getMemberListItems(
      [{ members: [roleMember], role }],
      1,
      [{ count: 1, roleId: role.id }],
      () => "Busy",
    );

    expect(memberItems).toStrictEqual([
      { description: "Alice · Busy", group: "Mod — 1", hasMarkSlot: true, title: "Ally", value: roleMember.id },
    ]);
  });
});
