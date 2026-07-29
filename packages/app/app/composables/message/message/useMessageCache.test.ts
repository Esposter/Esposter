// @vitest-environment nuxt
import type { MessageEntity } from "@esposter/db-schema";
import type { VueWrapper } from "@vue/test-utils";
import type { Router } from "vue-router";

import { goOffline } from "@/composables/shared/network.test";
import { MessageIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MessageIndexedDbStoreConfiguration";
import { resetIndexedDb } from "@/services/cache/indexedDb/openIndexedDb";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";
import { useDataStore } from "@/store/message/data";
import { getMockSession } from "@@/server/trpc/context.test";
import { StandardMessageEntity } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useMessageCache, () => {
  let router: Router;
  let wrapper: VueWrapper;
  let flush: () => Promise<void>;
  let items: Ref<MessageEntity[]>;
  const partitionKey = crypto.randomUUID();
  const secondPartitionKey = crypto.randomUUID();
  const rowKey = crypto.randomUUID();
  const message = "message";
  const flushCache = async () => {
    await flushPromises();
    await flush();
  };
  // Router.currentRoute is a shallowRef, so mutating params.id does not trigger
  // Reactivity — this helper replaces the mutation and forces dependents to update
  const setRouteId = (id: string) => {
    router.currentRoute.value.params.id = id;
    triggerRef(router.currentRoute);
  };
  // Capture router and pinia from inside the mounted component's scope
  // Because mountSuspended creates its own context
  const mountCache = async (initialRouteId: string = partitionKey) => {
    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          router = useRouter();
          router.currentRoute.value.params.id = initialRouteId;
          triggerRef(router.currentRoute);
          const dataStore = useDataStore();
          ({ items } = storeToRefs(dataStore));
          ({ flush } = useMessageCache());

          onUnmounted(() => {
            items.value = [];
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

  test("persists messages to cache when items change", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await mountCache();
    items.value = [new StandardMessageEntity({ message, partitionKey, rowKey, userId })];
    await flushCache();
    const cachedMessages = await readIndexedDb(MessageIndexedDbStoreConfiguration, partitionKey);

    expect(cachedMessages).toHaveLength(1);
    expect(takeOne(cachedMessages).message).toStrictEqual(message);
  });

  test("does not persist loading messages", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await mountCache();
    items.value = [new StandardMessageEntity({ isLoading: true, message, partitionKey, rowKey, userId })];
    await flushCache();
    const cachedMessages = await readIndexedDb(MessageIndexedDbStoreConfiguration, partitionKey);

    expect(cachedMessages).toHaveLength(0);
  });

  test("populates store from cache when switching rooms offline", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await writeIndexedDb(
      MessageIndexedDbStoreConfiguration,
      [new StandardMessageEntity({ message, partitionKey: secondPartitionKey, rowKey, userId })],
      secondPartitionKey,
    );
    await mountCache();
    setRouteId(secondPartitionKey);
    await flushCache();

    expect(items.value).toHaveLength(1);
    expect(takeOne(items.value).message).toStrictEqual(message);
  });
});
