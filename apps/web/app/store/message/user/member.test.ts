// @vitest-environment nuxt
import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";
import type { RoomRoleInMessage } from "@esposter/db-schema";

import { createRoomRole } from "@/services/message/member/createRoomRole.test";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { createUser } from "@/services/message/user/createUser.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useRoleStore } from "@/store/message/room/role";
import { useMemberStore } from "@/store/message/user/member";
import { beforeEach, describe, expect, test } from "vitest";

describe(useMemberStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const otherRoomId = crypto.randomUUID();
  const user = createUser();
  const member: MemberInRoom = { ...user, displayName: user.name };
  const role = createRoomRole({ roomId });

  // Reads the member's roles the way the member list does, so the store knows they are the whole set
  const loadMemberRoles = async (readRoomId: string, memberRoles: RoomRoleInMessage[]) => {
    trpcMsw.role.readMemberRoles.query(() =>
      memberRoles.map((memberRole) => ({
        role: memberRole,
        roleId: memberRole.id,
        roomId: readRoomId,
        userId: member.id,
      })),
    );
    await useRoleStore().readMemberRoles({ roomId: readRoomId, userIds: [member.id] });
  };

  beforeEach(() => {
    setCurrentRoomId(roomId);
  });

  test("deletes a roled member out of their role group", async () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { getMemberCountsRef, storeDeleteMember } = memberStore;
    const { memberCount, memberCountsByTopRole } = storeToRefs(memberStore);
    // The member list headers derive the roleless group as memberCount - sum(role groups), so a departure that
    // Drops only the total leaves the leaver in their role group and takes the remainder negative
    await loadMemberRoles(roomId, [role]);
    getMemberCountsRef(roomId).value.count = 1;
    getMemberCountsRef(roomId).value.countsByTopRole = [{ count: 1, roleId: role.id }];
    await storeDeleteMember(roomId, member.id);

    expect(memberCount.value).toBe(0);
    expect(memberCountsByTopRole.value).toStrictEqual([{ count: 0, roleId: role.id }]);
  });

  // A member outside the loaded pages has no roles read into this store, so their group is unknown here. The room's
  // Group counts are re-read from the server, which has already applied the departure
  test("a leave from an unloaded page keeps every group count equal to its members", async () => {
    expect.hasAssertions();

    trpcMsw.room.readMemberCountsByTopRole.query(() => [{ count: 299, roleId: role.id }]);
    const memberStore = useMemberStore();
    const { getMemberCountsRef, storeDeleteMember } = memberStore;
    const { memberCount, memberCountsByTopRole } = storeToRefs(memberStore);
    getMemberCountsRef(roomId).value.count = 300;
    getMemberCountsRef(roomId).value.countsByTopRole = [{ count: 300, roleId: role.id }];
    await storeDeleteMember(roomId, member.id);

    expect(memberCount.value).toBe(299);
    expect(memberCountsByTopRole.value).toStrictEqual([{ count: 299, roleId: role.id }]);
  });

  // A role event for a member whose roles were never read writes their roles, but the server never said what they
  // Were, so the leave still has to re-read the group counts rather than trust the entry the event wrote
  test("a leave after a role event for a member never read re-reads the group counts", async () => {
    expect.hasAssertions();

    trpcMsw.room.readMemberCountsByTopRole.query(() => [{ count: 299, roleId: role.id }]);
    const roleStore = useRoleStore();
    const { mutateMemberRoles } = roleStore;
    const memberStore = useMemberStore();
    const { getMemberCountsRef, storeDeleteMember } = memberStore;
    const { memberCount, memberCountsByTopRole } = storeToRefs(memberStore);
    getMemberCountsRef(roomId).value.count = 300;
    getMemberCountsRef(roomId).value.countsByTopRole = [{ count: 300, roleId: role.id }];
    mutateMemberRoles(roomId, member.id, [role]);
    await storeDeleteMember(roomId, member.id);

    expect(memberCount.value).toBe(299);
    expect(memberCountsByTopRole.value).toStrictEqual([{ count: 299, roleId: role.id }]);
  });

  // The leave subscription spans every room the user is in, so the event names the room it happened in. Applied
  // To the open one instead, a departure from anywhere removes a member who is still there
  test("leaves the open room alone when a member leaves another room", async () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { getMemberCountsRef, storeCreateMember, storeDeleteMember } = memberStore;
    const { memberCount, memberCountsByTopRole, members } = storeToRefs(memberStore);
    await loadMemberRoles(roomId, [role]);
    await loadMemberRoles(otherRoomId, []);
    storeCreateMember(roomId, member);
    getMemberCountsRef(roomId).value.countsByTopRole = [{ count: 1, roleId: role.id }];
    await storeDeleteMember(otherRoomId, member.id);

    expect(members.value).toStrictEqual([member]);
    expect(memberCount.value).toBe(1);
    expect(memberCountsByTopRole.value).toStrictEqual([{ count: 1, roleId: role.id }]);
  });

  test("leaves the open room alone when a member joins another room", () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { storeCreateMember } = memberStore;
    const { memberCount, members } = storeToRefs(memberStore);
    storeCreateMember(otherRoomId, member);

    expect(members.value).toStrictEqual([]);
    expect(memberCount.value).toBe(0);
  });

  // The offline cache decides whether to hydrate or persist by asking whether the loaded rows are the current
  // Room's. A list shared across rooms cannot answer that, and every guard built on top of one is a guess
  test("scopes the member list to the current room", () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { storeCreateMember } = memberStore;
    const { members } = storeToRefs(memberStore);
    storeCreateMember(roomId, member);

    expect(members.value).toStrictEqual([member]);

    setCurrentRoomId(crypto.randomUUID());

    expect(members.value).toStrictEqual([]);
  });

  test("keeps the server-resolved display name on the member row", () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { storeCreateMember } = memberStore;
    const { members } = storeToRefs(memberStore);
    storeCreateMember(roomId, { ...member, displayName: "Ally" });

    expect(members.value).toStrictEqual([{ ...member, displayName: "Ally" }]);
  });

  test("deletes a roleless member without touching the role groups", async () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { getMemberCountsRef, storeDeleteMember } = memberStore;
    const { memberCount, memberCountsByTopRole } = storeToRefs(memberStore);
    await loadMemberRoles(roomId, []);
    getMemberCountsRef(roomId).value.count = 2;
    getMemberCountsRef(roomId).value.countsByTopRole = [{ count: 1, roleId: role.id }];
    await storeDeleteMember(roomId, member.id);

    expect(memberCount.value).toBe(1);
    expect(memberCountsByTopRole.value).toStrictEqual([{ count: 1, roleId: role.id }]);
  });
});
