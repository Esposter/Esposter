// @vitest-environment nuxt
import type { MemberCountByTopRole } from "#shared/models/db/room/MemberCountByTopRole";
import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";

import { useReadMembers } from "#src/composables/message/room/useReadMembers";
import { setCurrentRoomId } from "#src/services/message/room/setCurrentRoomId.test";
import { createUser } from "#src/services/message/user/createUser.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useMemberStore } from "#src/store/message/user/member";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(useReadMembers, () => {
  const { trpcMsw } = setupMswTrpc();
  let memberCount: Ref<number | undefined>;
  let memberCountsByTopRole: Ref<MemberCountByTopRole[]>;
  let members: Ref<MemberInRoom[]>;
  let readMembers: ReturnType<typeof useReadMembers>["readMembers"];
  const roomId = v7();
  const otherRoomId = v7();
  const roleId = v7();
  const newCount = 1;
  const user = createUser({ name: "name" });
  const member: MemberInRoom = { ...user, displayName: user.name };

  const mountRead = async () => {
    await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          setCurrentRoomId(roomId);
          const memberStore = useMemberStore();
          ({ memberCount, memberCountsByTopRole, members } = storeToRefs(memberStore));
          ({ readMembers } = useReadMembers());
        },
      }),
    );
  };

  // The member's row as the room's read returns it, live or removed, at the version the server left it
  const serveMember = (deletedAt: Date | null, version: number) => {
    trpcMsw.room.readMembers.query(() => ({
      items: [{ ...member, deletedAt, roomId, userId: user.id, version }],
      nextCursor: "",
    }));
  };
  // A member's read of the room also reads their statuses and roles, which an empty answer keeps out of the way
  const serveMemberMetadata = () => {
    trpcMsw.room.readMembersCount.query(() => 1);
    trpcMsw.room.readMemberCountsByTopRole.query(() => []);
    trpcMsw.user.readStatuses.query(() => []);
    trpcMsw.role.readMemberRoles.query(() => []);
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // The member list headers derive the roleless group as memberCount - sum(role groups), so totals filed under the
  // Room switched to render a group count for a membership they never described — negative, where the room
  // Being entered has fewer members than the one left behind
  test("files the member totals under the room they were read for", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseReads } = Promise.withResolvers<void>();
    trpcMsw.room.readMembersCount.query(async () => {
      await readGate;
      return newCount;
    });
    trpcMsw.room.readMemberCountsByTopRole.query(async () => {
      await readGate;
      return [{ count: newCount, roleId }];
    });
    trpcMsw.room.readMembers.query(async () => {
      await readGate;
      return { items: [], nextCursor: "" };
    });
    await mountRead();
    const pendingRead = readMembers();
    // The reads are issued a microtask after the call, so let them go out before the room moves
    await flushPromises();
    // The user switches rooms while the three reads are still in flight
    setCurrentRoomId(otherRoomId);
    releaseReads();
    await pendingRead;

    expect(memberCount.value).toBeUndefined();
    expect(memberCountsByTopRole.value).toStrictEqual([]);

    setCurrentRoomId(roomId);

    expect(memberCount.value).toBe(newCount);
    expect(memberCountsByTopRole.value).toStrictEqual([{ count: newCount, roleId }]);
  });

  // The room's read returns a removed member as a tombstone, so the list reads the removal and never draws the row
  test("hides a member the page returns as a tombstone", async () => {
    expect.hasAssertions();

    serveMemberMetadata();
    serveMember(new Date(1), 1);
    await mountRead();
    await readMembers();

    expect(members.value.map(({ id }) => id)).toStrictEqual([]);
  });

  // A removal that a later read brings back drops the member the list already holds, since absence never removes a row
  // And the removal is what the read now says of that row
  test("drops a held member once a later read returns their removal", async () => {
    expect.hasAssertions();

    serveMemberMetadata();
    serveMember(null, 0);
    await mountRead();
    await readMembers();

    expect(members.value.map(({ id }) => id)).toStrictEqual([user.id]);

    serveMember(new Date(1), 1);
    await readMembers();

    expect(members.value.map(({ id }) => id)).toStrictEqual([]);
  });
});
