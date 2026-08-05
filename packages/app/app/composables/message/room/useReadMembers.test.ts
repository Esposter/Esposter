// @vitest-environment nuxt
import type { MemberCountByTopRole } from "#shared/models/db/room/MemberCountByTopRole";
import type { VueWrapper } from "@vue/test-utils";
import type { Router } from "vue-router";

import { useReadMembers } from "@/composables/message/room/useReadMembers";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useMemberStore } from "@/store/message/user/member";
import { noop } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(useReadMembers, () => {
  const server = setupMswTrpc();
  let wrapper: VueWrapper;
  let router: Router;
  let count: Ref<number>;
  let countsByTopRole: Ref<MemberCountByTopRole[]>;
  let readMembers: ReturnType<typeof useReadMembers>["readMembers"];
  const roomId = crypto.randomUUID();
  const otherRoomId = crypto.randomUUID();
  const roleId = crypto.randomUUID();
  const newCount = 5;

  const setRouteId = (id: string) => {
    router.currentRoute.value.params.id = id;
    triggerRef(router.currentRoute);
  };
  const mountRead = async () => {
    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          router = useRouter();
          setRouteId(roomId);
          const memberStore = useMemberStore();
          ({ count, countsByTopRole } = storeToRefs(memberStore));
          ({ readMembers } = useReadMembers());
        },
      }),
    );
  };

  afterEach(() => {
    wrapper?.unmount();
    vi.restoreAllMocks();
  });

  // The member list headers derive the roleless group as count - sum(role groups), so totals filed under the
  // Room switched to render a group count for a membership they never described — negative, where the room
  // Being entered has fewer members than the one left behind
  test("files the member totals under the room they were read for", async () => {
    expect.hasAssertions();

    let releaseReads = noop;
    const readGate = new Promise<void>((resolve) => {
      releaseReads = resolve;
    });
    server.use(
      trpcMsw.room.countMembers.query(async () => {
        await readGate;
        return newCount;
      }),
      trpcMsw.room.countMembersByTopRole.query(async () => {
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
    setRouteId(otherRoomId);
    releaseReads();
    await pendingRead;

    expect(count.value).toBe(0);
    expect(countsByTopRole.value).toStrictEqual([]);

    setRouteId(roomId);

    expect(count.value).toBe(newCount);
    expect(countsByTopRole.value).toStrictEqual([{ count: newCount, roleId }]);
  });
});
