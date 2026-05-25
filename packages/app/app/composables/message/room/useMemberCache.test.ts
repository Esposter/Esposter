// @vitest-environment nuxt
import type { User } from "@esposter/db-schema";
import type { VueWrapper } from "@vue/test-utils";
import type { Router } from "vue-router";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { MemberIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MemberIndexedDbStoreConfiguration";
import { resetIndexedDb } from "@/services/cache/indexedDb/openIndexedDb";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";
import { useMemberStore } from "@/store/message/user/member";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const goOffline = () => {
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
  window.dispatchEvent(new Event("offline"));
};

describe(useMemberCache, () => {
  let router: Router;
  let wrapper: VueWrapper;
  let flush: () => Promise<void>;
  let count: Ref<number>;
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
    updatedAt: new Date(),
  } satisfies User;
  const flushCache = async () => {
    await flushPromises();
    await flush();
  };
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
          ({ count, members } = storeToRefs(memberStore));
          ({ initializeCursorPaginationData } = memberStore);
          ({ flush } = useMemberCache());

          onUnmounted(() => {
            count.value = 0;
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

  test("persists members to cache when items change", async () => {
    expect.hasAssertions();

    await mountCache();
    const data = new CursorPaginationData<User>();
    data.items = [user];
    initializeCursorPaginationData(data);
    await flushCache();
    const cachedMembers = await readIndexedDb(MemberIndexedDbStoreConfiguration, partitionKey);

    expect(cachedMembers).toHaveLength(1);
    expect(takeOne(cachedMembers).id).toStrictEqual(user.id);
  });

  test("populates store from cache when switching rooms offline", async () => {
    expect.hasAssertions();

    await writeIndexedDb(MemberIndexedDbStoreConfiguration, [user], secondPartitionKey);
    await mountCache();
    setRouteId(secondPartitionKey);
    await flushCache();

    expect(members.value).toHaveLength(1);
    expect(count.value).toBe(1);
    expect(takeOne(members.value).id).toStrictEqual(user.id);
  });
});
