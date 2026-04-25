// @vitest-environment nuxt
import type { MessageEntity } from "@esposter/db-schema";
import type { VueWrapper } from "@vue/test-utils";
import type { Router } from "vue-router";

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
import { afterEach, describe, expect, test, vi } from "vitest";

describe(useMessageCache, () => {
  let router: Router;
  let wrapper: VueWrapper;
  let flush: () => Promise<void>;
  let items: Ref<MessageEntity[]>;
  const partitionKey = crypto.randomUUID();
  const secondPartitionKey = crypto.randomUUID();
  const rowKey = crypto.randomUUID();
  const message = "message";
  const goOffline = () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    window.dispatchEvent(new Event("offline"));
  };
  const goOnline = () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    window.dispatchEvent(new Event("online"));
  };
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
          const dataStore = useDataStore();
          ({ items } = storeToRefs(dataStore));
          ({ flush } = useMessageCache());
        },
      }),
    );
  };

  afterEach(async () => {
    if (wrapper) {
      items.value = [];
      wrapper.unmount();
    }
    vi.restoreAllMocks();
    await resetIndexedDb();
    const databases = await indexedDB.databases();
    await Promise.all(
      databases
        .filter((database): database is IDBDatabaseInfo & { name: string } => database.name !== undefined)
        .map(
          (database) =>
            new Promise<void>((resolve, reject) => {
              const request = indexedDB.deleteDatabase(database.name);
              request.onsuccess = () => {
                resolve();
              };
              request.onerror = () => {
                reject(request.error ?? new Error("Failed to delete database"));
              };
              request.onblocked = () => {
                resolve();
              };
            }),
        ),
    );
  });

  test("persists messages to cache when items change", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await mountCache();
    items.value = [new StandardMessageEntity({ message, partitionKey, rowKey, userId })];
    await flushCache();
    const cachedMessages = await readIndexedDb(MessageIndexedDbStoreConfiguration, partitionKey);

    expect(cachedMessages).toHaveLength(1);
    expect(takeOne(cachedMessages).message).toBe(message);
  });

  test("does not clear cache when items become empty on room switch", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await mountCache();
    items.value = [new StandardMessageEntity({ message, partitionKey, rowKey, userId })];
    await flushCache();
    setRouteId(crypto.randomUUID());
    await flushCache();
    const cachedMessages = await readIndexedDb(MessageIndexedDbStoreConfiguration, partitionKey);

    expect(cachedMessages).toHaveLength(1);
  });

  test("does not write to cache when room id is empty", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await mountCache("");
    items.value = [new StandardMessageEntity({ message, partitionKey, rowKey, userId })];
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
    goOffline();
    await mountCache();
    setRouteId(secondPartitionKey);
    await flushCache();

    expect(items.value).toHaveLength(1);
    expect(takeOne(items.value).message).toBe(message);
  });

  test("does not populate store from cache when switching rooms online", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await writeIndexedDb(
      MessageIndexedDbStoreConfiguration,
      [new StandardMessageEntity({ message, partitionKey: secondPartitionKey, rowKey, userId })],
      secondPartitionKey,
    );
    goOnline();
    await mountCache();
    setRouteId(secondPartitionKey);
    await flushCache();

    expect(items.value).toHaveLength(0);
  });

  test("does not populate store if room changed during async read", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await writeIndexedDb(
      MessageIndexedDbStoreConfiguration,
      [new StandardMessageEntity({ message, partitionKey, rowKey, userId })],
      partitionKey,
    );
    goOffline();
    await mountCache(crypto.randomUUID());
    setRouteId(partitionKey);
    setRouteId(crypto.randomUUID());
    await flushCache();

    expect(items.value).toHaveLength(0);
  });
});
