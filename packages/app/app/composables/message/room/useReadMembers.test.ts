// @vitest-environment nuxt
import type { MemberCountByTopRole } from "#shared/models/db/room/MemberCountByTopRole";
import type { VueWrapper } from "@vue/test-utils";

import { useReadMembers } from "@/composables/message/room/useReadMembers";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useMemberStore } from "@/store/message/user/member";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(useReadMembers, () => {
  const server = setupMswTrpc();
  let wrapper: VueWrapper;
  let memberCount: Ref<number>;
  let memberCountsByTopRole: Ref<MemberCountByTopRole[]>;
  let readMembers: ReturnType<typeof useReadMembers>["readMembers"];
  const roomId = crypto.randomUUID();
  const otherRoomId = crypto.randomUUID();
  const roleId = crypto.randomUUID();
  const newCount = 5;

  const mountRead = async () => {
    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          setCurrentRoomId(roomId);
          const memberStore = useMemberStore();
          ({ memberCount, memberCountsByTopRole } = storeToRefs(memberStore));
          ({ readMembers } = useReadMembers());
        },
      }),
    );
  };

  afterEach(() => {
    wrapper?.unmount();
    vi.restoreAllMocks();
  });

  // The member list headers derive the roleless group as memberCount - sum(role groups), so totals filed under the
  // Room switched to render a group count for a membership they never described — negative, where the room
  // Being entered has fewer members than the one left behind
  test("files the member totals under the room they were read for", async () => {
    expect.hasAssertions();

    const { promise: readsPromise, resolve: releaseReads } = Promise.withResolvers<void>();
    const readGate = readsPromise;
    server.use(
      trpcMsw.room.readMembersCount.query(async () => {
        await readGate;
        return newCount;
      }),
      trpcMsw.room.readMemberCountsByTopRole.query(async () => {
        await readGate;
        return [{ count: newCount, roleId }];
      }),
      trpcMsw.room.readMembers.query(async () => {
        await readGate;
        return { hasMore: false, items: [], nextCursor: "" };
      }),
    );
    await mountRead();
    const pendingRead = readMembers();
    // The reads are issued a microtask after the call, so let them go out before the room moves
    await flushPromises();
    // The user switches rooms while the three reads are still in flight
    setCurrentRoomId(otherRoomId);
    releaseReads();
    await pendingRead;

    expect(memberCount.value).toBe(0);
    expect(memberCountsByTopRole.value).toStrictEqual([]);

    setCurrentRoomId(roomId);

    expect(memberCount.value).toBe(newCount);
    expect(memberCountsByTopRole.value).toStrictEqual([{ count: newCount, roleId }]);
  });
});
