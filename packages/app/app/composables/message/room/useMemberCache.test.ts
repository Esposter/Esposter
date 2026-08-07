// @vitest-environment nuxt
import type { MemberCountByTopRole } from "#shared/models/db/room/MemberCountByTopRole";
import type { User } from "@esposter/db-schema";
import type { VueWrapper } from "@vue/test-utils";
import type { Router } from "vue-router";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { flushCache } from "@/composables/cache/indexedDb/flushCache.test";
import { goOffline } from "@/composables/shared/network.test";
import { MemberIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MemberIndexedDbStoreConfiguration";
import { resetIndexedDb } from "@/services/cache/indexedDb/openIndexedDb";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";
import { useMemberStore } from "@/store/message/user/member";
import { StorageTier } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useMemberCache, () => {
  let router: Router;
  let wrapper: VueWrapper;
  let count: Ref<number>;
  let countsByTopRole: Ref<MemberCountByTopRole[]>;
  let members: Ref<User[]>;
  let initializeCursorPaginationData: (data: CursorPaginationData<User>) => void;
  const partitionKey = crypto.randomUUID();
  const secondPartitionKey = crypto.randomUUID();
  const user = {
    biography: "",
    createdAt: new Date(),
    deletedAt: null,
    email: "email@example.com",
    emailVerified: true,
    id: crypto.randomUUID(),
    image: "",
    name: "name",
    storageBytesUsed: 0,
    storageTier: StorageTier.Free,
    updatedAt: new Date(),
  } satisfies User;
  const setRouteId = (id: string) => {
    router.currentRoute.value.params.id = id;
    triggerRef(router.currentRoute);
  };
  const mountCache = async (initialRouteId: string = partitionKey) => {
    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          router = useRouter();
          router.currentRoute.value.params.id = initialRouteId;
          triggerRef(router.currentRoute);
          const memberStore = useMemberStore();
          ({ count, countsByTopRole, members } = storeToRefs(memberStore));
          ({ initializeCursorPaginationData } = memberStore);
          useMemberCache();

          onUnmounted(() => {
            count.value = 0;
            countsByTopRole.value = [];
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
    count.value = 5;
    countsByTopRole.value = [{ count: 5, roleId: crypto.randomUUID() }];
    setRouteId(secondPartitionKey);
    await flushCache();

    expect(members.value).toHaveLength(1);
    expect(count.value).toBe(1);
    expect(countsByTopRole.value).toStrictEqual([]);
    expect(takeOne(members.value).id).toStrictEqual(user.id);
  });
});
