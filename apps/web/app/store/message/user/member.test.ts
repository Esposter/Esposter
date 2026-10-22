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

  // Resolves on the room's next totals write, the store's own signal that a read has landed
  const waitForCountsByTopRole = () => {
    const memberStore = useMemberStore();
    const { memberCountsByTopRole } = storeToRefs(memberStore);
    return new Promise<void>((resolve) => {
      const stopWatching = watch(memberCountsByTopRole, () => {
        stopWatching();
        resolve();
      });
    });
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
    storeDeleteMember(roomId, member.id);

    expect(memberCount.value).toBe(0);
    expect(memberCountsByTopRole.value).toStrictEqual([{ count: 0, roleId: role.id }]);
  });

  // A member outside the loaded pages has no roles read into this store, so their group is unknown here. The room's
  // Group counts are re-read from the server, which has already applied the departure
  test("a leave from an unloaded page keeps every group count equal to its members", async () => {
    expect.hasAssertions();

    trpcMsw.room.readMemberCountsByTopRole.query(() => [{ count: 1, roleId: role.id }]);
    const memberStore = useMemberStore();
    const { getMemberCountsRef, storeDeleteMember } = memberStore;
    const { memberCount, memberCountsByTopRole } = storeToRefs(memberStore);
    getMemberCountsRef(roomId).value.count = 2;
    getMemberCountsRef(roomId).value.countsByTopRole = [{ count: 2, roleId: role.id }];
    const countsByTopRoleWritten = waitForCountsByTopRole();
    storeDeleteMember(roomId, member.id);
    await countsByTopRoleWritten;

    expect(memberCount.value).toBe(1);
    expect(memberCountsByTopRole.value).toStrictEqual([{ count: 1, roleId: role.id }]);
  });

  // A role event for a member whose roles were never read cannot say what they held before it, so the group counts
  // Are re-read rather than moved by a delta the store cannot prove
  test("a leave after a role event for a member never read re-reads the group counts", async () => {
    expect.hasAssertions();

    trpcMsw.room.readMemberCountsByTopRole.query(() => [{ count: 0, roleId: role.id }]);
    const roleStore = useRoleStore();
    const { mutateMemberRoles } = roleStore;
    const memberStore = useMemberStore();
    const { getMemberCountsRef, storeDeleteMember } = memberStore;
    const { memberCount, memberCountsByTopRole } = storeToRefs(memberStore);
    getMemberCountsRef(roomId).value.count = 1;
    getMemberCountsRef(roomId).value.countsByTopRole = [{ count: 1, roleId: role.id }];
    mutateMemberRoles(roomId, member.id, [role]);
    const countsByTopRoleWritten = waitForCountsByTopRole();
    storeDeleteMember(roomId, member.id);
    await countsByTopRoleWritten;

    expect(memberCount.value).toBe(0);
    expect(memberCountsByTopRole.value).toStrictEqual([{ count: 0, roleId: role.id }]);
  });

  // The member moves from the role group they held to a role the store has never counted for them. Their prior role
  // Is unknown here, so a delta would add to the new group and leave the old one overcounted
  test("a role change to a member outside the loaded pages keeps every group count equal to its members", async () => {
    expect.hasAssertions();

    const otherRole = createRoomRole({ roomId });
    trpcMsw.room.readMemberCountsByTopRole.query(() => [
      { count: 0, roleId: role.id },
      { count: 1, roleId: otherRole.id },
    ]);
    const roleStore = useRoleStore();
    const { mutateMemberRoles } = roleStore;
    const memberStore = useMemberStore();
    const { getMemberCountsRef } = memberStore;
    const { memberCountsByTopRole } = storeToRefs(memberStore);
    getMemberCountsRef(roomId).value.countsByTopRole = [{ count: 1, roleId: role.id }];
    const countsByTopRoleWritten = waitForCountsByTopRole();
    mutateMemberRoles(roomId, member.id, [otherRole]);
    await countsByTopRoleWritten;

    expect(memberCountsByTopRole.value).toStrictEqual([
      { count: 0, roleId: role.id },
      { count: 1, roleId: otherRole.id },
    ]);
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
    storeDeleteMember(otherRoomId, member.id);

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
    storeDeleteMember(roomId, member.id);

    expect(memberCount.value).toBe(1);
    expect(memberCountsByTopRole.value).toStrictEqual([{ count: 1, roleId: role.id }]);
  });
});
