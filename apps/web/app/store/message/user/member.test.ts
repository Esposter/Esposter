// @vitest-environment nuxt
import type { MemberCountByTopRole } from "#shared/models/db/room/MemberCountByTopRole";
import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";
import type { MemberRow } from "#shared/models/db/room/MemberRow";
import type { UserInRoom } from "#shared/models/db/room/UserInRoom";
import type { PublicUser, RoomRoleInMessage } from "@esposter/db-schema";

import { useUserToRoomSubscribables } from "#src/composables/message/subscribables/useUserToRoomSubscribables";
import { createRoomRole } from "#src/services/message/member/createRoomRole.test";
import { serveMemberRoles } from "#src/services/message/member/serveMemberRoles.test";
import { createUserToRoom } from "#src/services/message/room/createUserToRoom.test";
import { setCurrentRoomId } from "#src/services/message/room/setCurrentRoomId.test";
import { createUser } from "#src/services/message/user/createUser.test";
import { readActiveTopicReads } from "#src/services/realtime/collectTopics";
import { getLastOpenRealtimeSocketCall } from "#src/services/realtime/openRealtimeSocket.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useRoleStore } from "#src/store/message/room/role";
import { useUserStore } from "#src/store/message/user/index";
import { useMemberStore } from "#src/store/message/user/member";
import { useConnectionStore } from "#src/store/realtime/connection";
import { getScopeTopic, usersToRoomsInMessage } from "@esposter/db-schema";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { getTableName } from "drizzle-orm";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(
  import("#src/services/realtime/openRealtimeSocket"),
  () => import("#src/services/realtime/openRealtimeSocket.test"),
);

describe(useMemberStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const otherRoomId = v7();
  const user = createUser();
  const member: MemberInRoom = { ...user, displayName: user.name };
  const role = createRoomRole({ roomId });

  // The membership row a join announces, at the version the join left it, beside the person who joined
  const joinRow = (
    joinedUser: PublicUser,
    displayName: string,
    joinedRoomId = roomId,
    version = 0,
  ): MemberRow & { user: PublicUser } => ({
    deletedAt: null,
    displayName,
    roomId: joinedRoomId,
    user: joinedUser,
    userId: joinedUser.id,
    version,
  });
  // The tombstone a removal leaves: the membership row, removed, at the version the removal wrote
  const leftRow = (leftUserId: string, leftRoomId: string, version = 1): MemberRow => ({
    deletedAt: new Date(1),
    displayName: member.displayName,
    roomId: leftRoomId,
    userId: leftUserId,
    version,
  });
  // The server's totals for a room, as the next read of them returns them
  const serveCounts = (count: number, countsByTopRole: MemberCountByTopRole[]) => {
    trpcMsw.room.readMembersCount.query(() => count);
    trpcMsw.room.readMemberCountsByTopRole.query(() => countsByTopRole);
  };

  // Reads the member's roles the way the member list does, so the store knows what they hold
  const loadMemberRoles = async (readRoomId: string, memberRoles: RoomRoleInMessage[]) => {
    serveMemberRoles(trpcMsw, readRoomId, member.id, memberRoles);
    await useReadMemberRoles()({ roomId: readRoomId, userIds: [member.id] });
  };

  beforeEach(() => {
    setCurrentRoomId(roomId);
    serveCounts(0, []);
  });

  // The member's roles are read into the store, so a leave can clear the group they were counted in
  test("a leave drops a roled member out of their role group", async () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { arriveJoinedMember, arriveLeftMember, refreshMemberCounts } = memberStore;
    const { memberCount, memberCountsByTopRole } = storeToRefs(memberStore);
    arriveJoinedMember(joinRow(user, member.displayName));
    await loadMemberRoles(roomId, [role]);
    serveCounts(1, [{ count: 1, roleId: role.id }]);
    await refreshMemberCounts([roomId]);
    serveCounts(0, [{ count: 0, roleId: role.id }]);
    arriveLeftMember(leftRow(member.id, roomId));
    // The departure's own re-read lands the totals, so the test awaits it rather than making one of its own
    await waitForSynchronizedFunctions();

    expect(memberCount.value).toBe(0);
    expect(memberCountsByTopRole.value).toStrictEqual([{ count: 0, roleId: role.id }]);
  });

  // A member outside the loaded pages has no roles read into this store, so their group is unknown here. The room's
  // Totals are re-read from the server, which has already applied the departure
  test("a leave from an unloaded page keeps every group count equal to its members", async () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { arriveLeftMember, refreshMemberCounts } = memberStore;
    const { memberCount, memberCountsByTopRole } = storeToRefs(memberStore);
    serveCounts(2, [{ count: 2, roleId: role.id }]);
    await refreshMemberCounts([roomId]);
    serveCounts(1, [{ count: 1, roleId: role.id }]);
    arriveLeftMember(leftRow(member.id, roomId));
    await waitForSynchronizedFunctions();

    expect(memberCount.value).toBe(1);
    expect(memberCountsByTopRole.value).toStrictEqual([{ count: 1, roleId: role.id }]);
  });

  // A group read that fails leaves the pair the last settled read wrote standing: the total is written only with the
  // Groups it was read beside, so a failed run changes neither. The retry the batched refresh schedules then lands the
  // Server's totals, and they equal the members left in the room
  test("a failed count re-read keeps the pre-leave counts, then every group count equal to its members once the retry lands", async () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { arriveLeftMember, refreshMemberCounts } = memberStore;
    const { memberCount, memberCountsByTopRole } = storeToRefs(memberStore);
    serveCounts(2, [{ count: 2, roleId: role.id }]);
    await refreshMemberCounts([roomId]);
    const { promise: isFailureLogged, resolve: onFailureLogged } = Promise.withResolvers<void>();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {
      onFailureLogged();
    });
    let isGroupReadFailed = false;
    trpcMsw.room.readMembersCount.query(() => 1);
    trpcMsw.room.readMemberCountsByTopRole.query(() => {
      if (isGroupReadFailed) return [{ count: 1, roleId: role.id }];
      isGroupReadFailed = true;
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    arriveLeftMember(leftRow(member.id, roomId));
    await isFailureLogged;
    consoleError.mockRestore();

    expect(memberCount.value).toBe(2);
    expect(memberCountsByTopRole.value).toStrictEqual([{ count: 2, roleId: role.id }]);

    await refreshMemberCounts([roomId]);

    expect(memberCount.value).toBe(1);
    expect(memberCountsByTopRole.value).toStrictEqual([{ count: 1, roleId: role.id }]);
  });

  // The member moves from the role group they held to a role the store has never counted for them. A delta would
  // Need their prior role, which is unknown here, so the totals are re-read instead
  test("a role change to a member outside the loaded pages keeps every group count equal to its members", async () => {
    expect.hasAssertions();

    const otherRole = createRoomRole({ roomId });
    const memberStore = useMemberStore();
    const { refreshMemberCounts } = memberStore;
    const { memberCountsByTopRole } = storeToRefs(memberStore);
    const roleStore = useRoleStore();
    const { mutateMemberRoles } = roleStore;
    serveCounts(1, [{ count: 1, roleId: role.id }]);
    await refreshMemberCounts([roomId]);
    serveCounts(1, [
      { count: 0, roleId: role.id },
      { count: 1, roleId: otherRole.id },
    ]);
    mutateMemberRoles(roomId, member.id, [otherRole]);
    // The role change's own re-read lands the totals, so the test awaits it rather than making one of its own
    await waitForSynchronizedFunctions();

    expect(memberCountsByTopRole.value).toStrictEqual([
      { count: 0, roleId: role.id },
      { count: 1, roleId: otherRole.id },
    ]);
  });

  // A membership row is keyed by the room it is in, so a leave from another room leaves the open room's row standing
  test("leaves the open room alone when a member leaves another room", async () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { arriveJoinedMember, arriveLeftMember, refreshMemberCounts } = memberStore;
    const { memberCount, memberCountsByTopRole, members } = storeToRefs(memberStore);
    await loadMemberRoles(roomId, [role]);
    await loadMemberRoles(otherRoomId, []);
    serveCounts(1, [{ count: 1, roleId: role.id }]);
    await refreshMemberCounts([roomId]);
    arriveJoinedMember(joinRow(user, member.displayName));
    await refreshMemberCounts([roomId]);
    arriveLeftMember(leftRow(member.id, otherRoomId));
    await refreshMemberCounts([otherRoomId]);

    expect(members.value).toStrictEqual([member]);
    expect(memberCount.value).toBe(1);
    expect(memberCountsByTopRole.value).toStrictEqual([{ count: 1, roleId: role.id }]);
  });

  test("leaves the open room alone when a member joins another room", async () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { arriveJoinedMember, refreshMemberCounts } = memberStore;
    const { memberCount, members } = storeToRefs(memberStore);
    serveCounts(1, []);
    arriveJoinedMember(joinRow(user, member.displayName, otherRoomId));
    await refreshMemberCounts([otherRoomId]);

    expect(members.value).toStrictEqual([]);
    expect(memberCount.value).toBeUndefined();
  });

  // The offline cache decides whether to hydrate or persist by asking whether the loaded rows are the current
  // Room's. A list shared across rooms cannot answer that, and every guard built on top of one is a guess
  test("scopes the member list to the current room", async () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { arriveJoinedMember, refreshMemberCounts } = memberStore;
    const { members } = storeToRefs(memberStore);
    arriveJoinedMember(joinRow(user, member.displayName));
    await refreshMemberCounts([roomId]);

    expect(members.value).toStrictEqual([member]);

    setCurrentRoomId(v7());

    expect(members.value).toStrictEqual([]);
  });

  // The server pages members by display name case-insensitively, so an uppercase name sorts beside its lowercase one.
  // The loaded list is ordered the same way, so the names on screen and the cursor agree on each member's place
  test("orders the loaded members the way the server pages them", async () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { arriveJoinedMember } = memberStore;
    const { members } = storeToRefs(memberStore);
    const lowercaseUser = createUser({ name: "bob" });
    const uppercaseUser = createUser({ name: "Carl" });
    arriveJoinedMember(joinRow(uppercaseUser, "Carl"));
    arriveJoinedMember(joinRow(lowercaseUser, "bob"));
    await waitForSynchronizedFunctions();

    expect(members.value.map(({ displayName }) => displayName)).toStrictEqual(["bob", "Carl"]);
  });

  test("keeps the server-resolved display name on the member row", async () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { arriveJoinedMember } = memberStore;
    const { members } = storeToRefs(memberStore);
    arriveJoinedMember(joinRow(user, "displayName"));
    await waitForSynchronizedFunctions();

    expect(members.value).toStrictEqual([{ ...member, displayName: "displayName" }]);
  });

  test("a leave of a roleless member leaves the role groups as they were", async () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { arriveJoinedMember, arriveLeftMember, refreshMemberCounts } = memberStore;
    const { memberCount, memberCountsByTopRole } = storeToRefs(memberStore);
    arriveJoinedMember(joinRow(user, member.displayName));
    await loadMemberRoles(roomId, []);
    serveCounts(2, [{ count: 1, roleId: role.id }]);
    await refreshMemberCounts([roomId]);
    serveCounts(1, [{ count: 1, roleId: role.id }]);
    arriveLeftMember(leftRow(member.id, roomId));
    await waitForSynchronizedFunctions();

    expect(memberCount.value).toBe(1);
    expect(memberCountsByTopRole.value).toStrictEqual([{ count: 1, roleId: role.id }]);
  });

  // Another client renames this member. Its write publishes the room's membership topic, which the list's first page
  // Watches, and it sends the member the user event of the row it changed. The list re-reads the page on the topic, so
  // The event needs no read of the user by id, which is the read this test holds the subscribable to. The page is read
  // Through the store's own watched read, since a topic is named only while the read runs and an msw answer cannot name one
  test("refreshes a renamed member from another client's write with no read of the user by id", async () => {
    expect.hasAssertions();

    const connectionStore = useConnectionStore();
    connectionStore.openUser();
    const [, onUserFrame] = getLastOpenRealtimeSocketCall();
    effectScope().run(() => {
      useUserToRoomSubscribables();
    });
    const membershipTopic = getScopeTopic(getTableName(usersToRoomsInMessage), "roomId", roomId);
    const readUsersByIds = vi.fn<() => UserInRoom[]>(() => []);
    trpcMsw.room.readUsersByIds.query(readUsersByIds);
    const memberStore = useMemberStore();
    const { arriveMemberPage, readItems } = memberStore;
    const { members } = storeToRefs(memberStore);
    const userStore = useUserStore();
    const { storeUser } = userStore;
    storeUser(user);
    let displayName = member.displayName;
    let version = 0;
    await readItems(() => {
      readActiveTopicReads()?.push({ readAt: 0, signature: "", topics: [{ topic: membershipTopic }] });
      return Promise.resolve(
        arriveMemberPage({
          items: [{ ...member, deletedAt: null, displayName, roomId, userId: member.id, version }],
          nextCursor: "",
        }),
      );
    });
    displayName = "renamed";
    version = 1;
    onUserFrame?.(JSON.stringify({ data: { topic: membershipTopic }, type: "invalidate" }));
    onUserFrame?.(
      JSON.stringify({ data: createUserToRoom({ displayName, roomId, userId: member.id }), type: "updateUserToRoom" }),
    );
    await waitForSynchronizedFunctions();

    expect(readUsersByIds).not.toHaveBeenCalled();
    expect(members.value).toStrictEqual([{ ...member, displayName }]);
  });
});
