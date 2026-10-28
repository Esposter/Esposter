// @vitest-environment nuxt
import type { MemberCountByTopRole } from "#shared/models/db/room/MemberCountByTopRole";
import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";
import type { RoomRoleInMessage } from "@esposter/db-schema";

import { createRoomRole } from "@/services/message/member/createRoomRole.test";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { createUser } from "@/services/message/user/createUser.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useRoleStore } from "@/store/message/room/role";
import { useMemberStore } from "@/store/message/user/member";
import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

// Resolves on the next write of the room's group totals, the store's own signal that a re-read has landed
const waitForCounts = (readRoomId: string) => {
  const memberStore = useMemberStore();
  const { getMemberCountsRef } = memberStore;
  return new Promise<void>((resolve) => {
    const stopWatching = watch(
      () => getMemberCountsRef(readRoomId).value.countsByTopRole,
      () => {
        stopWatching();
        resolve();
      },
    );
  });
};

describe(useMemberStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const otherRoomId = crypto.randomUUID();
  const user = createUser();
  const member: MemberInRoom = { ...user, displayName: user.name };
  const role = createRoomRole({ roomId });

  // The server's totals for a room, as the next read of them returns them
  const serveCounts = (count: number, countsByTopRole: MemberCountByTopRole[]) => {
    trpcMsw.room.readMembersCount.query(() => count);
    trpcMsw.room.readMemberCountsByTopRole.query(() => countsByTopRole);
  };

  // Reads the member's roles the way the member list does, so the store knows what they hold
  const loadMemberRoles = async (readRoomId: string, memberRoles: RoomRoleInMessage[]) => {
    trpcMsw.role.readMemberRoles.query(() =>
      memberRoles.map((memberRole) => ({
        createdAt: memberRole.createdAt,
        deletedAt: memberRole.deletedAt,
        role: memberRole,
        roleId: memberRole.id,
        roomId: readRoomId,
        updatedAt: memberRole.updatedAt,
        userId: member.id,
      })),
    );
    const roleStore = useRoleStore();
    await roleStore.readMemberRoles({ roomId: readRoomId, userIds: [member.id] });
  };

  beforeEach(() => {
    setCurrentRoomId(roomId);
    serveCounts(0, []);
  });

  test("deletes a roled member out of their role group", async () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { getMemberCountsRef, storeDeleteMember } = memberStore;
    const { memberCount, memberCountsByTopRole } = storeToRefs(memberStore);
    // The member list headers derive the roleless group as memberCount - sum(role groups), so a departure that
    // Drops only the total leaves the leaver in their role group and takes the remainder negative
    await loadMemberRoles(roomId, [role]);
    getMemberCountsRef(roomId).value.memberCount = 1;
    getMemberCountsRef(roomId).value.countsByTopRole = [{ count: 1, roleId: role.id }];
    serveCounts(0, [{ count: 0, roleId: role.id }]);
    const countsWritten = waitForCounts(roomId);
    storeDeleteMember(roomId, member.id);
    await countsWritten;

    expect(memberCount.value).toBe(0);
    expect(memberCountsByTopRole.value).toStrictEqual([{ count: 0, roleId: role.id }]);
  });

  // A member outside the loaded pages has no roles read into this store, so their group is unknown here. The room's
  // Totals are re-read from the server, which has already applied the departure
  test("a leave from an unloaded page keeps every group count equal to its members", async () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { getMemberCountsRef, storeDeleteMember } = memberStore;
    const { memberCount, memberCountsByTopRole } = storeToRefs(memberStore);
    getMemberCountsRef(roomId).value.memberCount = 2;
    getMemberCountsRef(roomId).value.countsByTopRole = [{ count: 2, roleId: role.id }];
    serveCounts(1, [{ count: 1, roleId: role.id }]);
    const countsWritten = waitForCounts(roomId);
    storeDeleteMember(roomId, member.id);
    await countsWritten;

    expect(memberCount.value).toBe(1);
    expect(memberCountsByTopRole.value).toStrictEqual([{ count: 1, roleId: role.id }]);
  });

  // A group read that fails leaves the pair the last settled read wrote standing: the total is written only with the
  // Groups it was read beside, so a failed run changes neither. The retry the batched refresh schedules then lands the
  // Server's totals, and they equal the members left in the room
  test("a failed count re-read keeps the pre-leave counts, then every group count equal to its members once the retry lands", async () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { getMemberCountsRef, storeDeleteMember } = memberStore;
    const { memberCount, memberCountsByTopRole } = storeToRefs(memberStore);
    const { promise: isFailureLogged, resolve: onFailureLogged } = Promise.withResolvers<void>();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {
      onFailureLogged();
    });
    let isGroupReadFailed = false;
    getMemberCountsRef(roomId).value.memberCount = 2;
    getMemberCountsRef(roomId).value.countsByTopRole = [{ count: 2, roleId: role.id }];
    trpcMsw.room.readMembersCount.query(() => 1);
    trpcMsw.room.readMemberCountsByTopRole.query(() => {
      if (isGroupReadFailed) return [{ count: 1, roleId: role.id }];
      isGroupReadFailed = true;
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    storeDeleteMember(roomId, member.id);
    await isFailureLogged;
    consoleError.mockRestore();

    expect(memberCount.value).toBe(2);
    expect(memberCountsByTopRole.value).toStrictEqual([{ count: 2, roleId: role.id }]);

    await waitForCounts(roomId);

    expect(memberCount.value).toBe(1);
    expect(memberCountsByTopRole.value).toStrictEqual([{ count: 1, roleId: role.id }]);
  });

  // The member moves from the role group they held to a role the store has never counted for them. A delta would
  // Need their prior role, which is unknown here, so the totals are re-read instead
  test("a role change to a member outside the loaded pages keeps every group count equal to its members", async () => {
    expect.hasAssertions();

    const otherRole = createRoomRole({ roomId });
    const memberStore = useMemberStore();
    const { getMemberCountsRef } = memberStore;
    const { memberCountsByTopRole } = storeToRefs(memberStore);
    const roleStore = useRoleStore();
    const { mutateMemberRoles } = roleStore;
    getMemberCountsRef(roomId).value.countsByTopRole = [{ count: 1, roleId: role.id }];
    serveCounts(1, [
      { count: 0, roleId: role.id },
      { count: 1, roleId: otherRole.id },
    ]);
    const countsWritten = waitForCounts(roomId);
    mutateMemberRoles(roomId, member.id, [otherRole]);
    await countsWritten;

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
    getMemberCountsRef(roomId).value.countsByTopRole = [{ count: 1, roleId: role.id }];
    serveCounts(1, [{ count: 1, roleId: role.id }]);
    const joinCountsWritten = waitForCounts(roomId);
    storeCreateMember(roomId, member);
    await joinCountsWritten;
    const otherRoomCountsWritten = waitForCounts(otherRoomId);
    storeDeleteMember(otherRoomId, member.id);
    await otherRoomCountsWritten;

    expect(members.value).toStrictEqual([member]);
    expect(memberCount.value).toBe(1);
    expect(memberCountsByTopRole.value).toStrictEqual([{ count: 1, roleId: role.id }]);
  });

  test("leaves the open room alone when a member joins another room", async () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { storeCreateMember } = memberStore;
    const { memberCount, members } = storeToRefs(memberStore);
    serveCounts(1, []);
    const otherRoomCountsWritten = waitForCounts(otherRoomId);
    storeCreateMember(otherRoomId, member);
    await otherRoomCountsWritten;

    expect(members.value).toStrictEqual([]);
    expect(memberCount.value).toBe(0);
  });

  // The offline cache decides whether to hydrate or persist by asking whether the loaded rows are the current
  // Room's. A list shared across rooms cannot answer that, and every guard built on top of one is a guess
  test("scopes the member list to the current room", async () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { storeCreateMember } = memberStore;
    const { members } = storeToRefs(memberStore);
    const countsWritten = waitForCounts(roomId);
    storeCreateMember(roomId, member);
    await countsWritten;

    expect(members.value).toStrictEqual([member]);

    setCurrentRoomId(crypto.randomUUID());

    expect(members.value).toStrictEqual([]);
  });

  test("keeps the server-resolved display name on the member row", async () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { storeCreateMember } = memberStore;
    const { members } = storeToRefs(memberStore);
    const countsWritten = waitForCounts(roomId);
    storeCreateMember(roomId, { ...member, displayName: "displayName" });
    await countsWritten;

    expect(members.value).toStrictEqual([{ ...member, displayName: "displayName" }]);
  });

  test("deletes a roleless member without touching the role groups", async () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { getMemberCountsRef, storeDeleteMember } = memberStore;
    const { memberCount, memberCountsByTopRole } = storeToRefs(memberStore);
    await loadMemberRoles(roomId, []);
    getMemberCountsRef(roomId).value.memberCount = 2;
    getMemberCountsRef(roomId).value.countsByTopRole = [{ count: 1, roleId: role.id }];
    serveCounts(1, [{ count: 1, roleId: role.id }]);
    const countsWritten = waitForCounts(roomId);
    storeDeleteMember(roomId, member.id);
    await countsWritten;

    expect(memberCount.value).toBe(1);
    expect(memberCountsByTopRole.value).toStrictEqual([{ count: 1, roleId: role.id }]);
  });
});
