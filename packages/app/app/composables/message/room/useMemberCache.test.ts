// @vitest-environment nuxt
import type { MemberCountByTopRole } from "#shared/models/db/room/MemberCountByTopRole";
import type { User } from "@esposter/db-schema";
import type { VueWrapper } from "@vue/test-utils";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { flushCache } from "@/composables/cache/indexedDb/flushCache.test";
import { goOffline } from "@/composables/shared/network.test";
import { MemberCounts } from "@/models/message/user/MemberCounts";
import { MemberIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MemberIndexedDbStoreConfiguration";
import { resetIndexedDb } from "@/services/cache/indexedDb/openIndexedDb";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { createUser } from "@/services/message/user/createUser.test";
import { useMemberStore } from "@/store/message/user/member";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useMemberCache, () => {
  let wrapper: VueWrapper;
  let count: ComputedRef<number>;
  let countsByTopRole: ComputedRef<MemberCountByTopRole[]>;
  let members: Ref<User[]>;
  let getMemberCountsRef: ReturnType<typeof useMemberStore>["getMemberCountsRef"];
  let initializeCursorPaginationData: (data: CursorPaginationData<User>) => void;
  const partitionKey = crypto.randomUUID();
  const secondPartitionKey = crypto.randomUUID();
  const user = createUser();
  const mountCache = async (initialRouteId: string = partitionKey) => {
    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          setCurrentRoomId(initialRouteId);
          const memberStore = useMemberStore();
          ({ count, countsByTopRole, members } = storeToRefs(memberStore));
          ({ getMemberCountsRef, initializeCursorPaginationData } = memberStore);
          useMemberCache();

          onUnmounted(() => {
            for (const roomId of [initialRouteId, secondPartitionKey])
              getMemberCountsRef(roomId).value = new MemberCounts();
            initializeCursorPaginationData(new CursorPaginationData<User>());
          });
        },
      }),
    );
  };

  beforeEach(() => {
    goOffline();
  });

  afterEach(async () => {
    wrapper?.unmount();
    vi.restoreAllMocks();
    await resetIndexedDb();
  });

  // The cache lifecycle itself belongs to usePaginationCache and is tested there for both variants. What only
  // This composable can get wrong is the wiring — the route id it takes as its partition key, and the store
  // Hook it hydrates through — so one end-to-end pass over both is all this suite owes
  test("populates store from cache when switching rooms offline", async () => {
    expect.hasAssertions();

    await writeIndexedDb(MemberIndexedDbStoreConfiguration, [user], secondPartitionKey);
    await mountCache();
    // Both totals are server-computed, so the room left behind is the last thing that set them. Neither can be
    // Refetched offline, and the room being switched into must not inherit either
    getMemberCountsRef(partitionKey).value.count = 5;
    getMemberCountsRef(partitionKey).value.countsByTopRole = [{ count: 5, roleId: crypto.randomUUID() }];
    setCurrentRoomId(secondPartitionKey);
    await flushCache();

    expect(members.value).toHaveLength(1);
    expect(count.value).toBe(1);
    expect(countsByTopRole.value).toStrictEqual([]);
    expect(takeOne(members.value).id).toStrictEqual(user.id);
  });
});
