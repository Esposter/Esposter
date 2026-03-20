import type { VueWrapper } from "@vue/test-utils";
import type { Router } from "vue-router";

import { resetMessageCacheDatabase } from "@/services/message/cache/openMessageCacheDatabase";
import { readCachedMessages } from "@/services/message/cache/readCachedMessages";
import { writeCachedMessages } from "@/services/message/cache/writeCachedMessages";
import { useDataStore } from "@/store/message/data";
import { StandardMessageEntity } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe(useMessageCache, () => {
  let router: Router;
  let wrapper: VueWrapper;
  const partitionKey = crypto.randomUUID();
  const rowKey = "rowKey";
  const message = "message";
  const userId = crypto.randomUUID();
  const goOffline = () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    window.dispatchEvent(new Event("offline"));
  };
  const goOnline = () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    window.dispatchEvent(new Event("online"));
  };
  const mountCache = async () => {
    wrapper = await mountSuspended(defineComponent({ render: () => h("div"), setup: () => useMessageCache() }));
  };

  beforeAll(() => {
    router = useRouter();
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    router.currentRoute.value.params.id = partitionKey;
  });

  afterEach(async () => {
    wrapper?.unmount();
    vi.restoreAllMocks();
    await resetMessageCacheDatabase();
    const databases = await indexedDB.databases();
    for (const database of databases) if (database.name) indexedDB.deleteDatabase(database.name);
  });

  test("persists messages to cache when items change", async () => {
    expect.hasAssertions();

    const dataStore = useDataStore();
    await mountCache();
    dataStore.items = [new StandardMessageEntity({ message, partitionKey, rowKey, userId })];
    await flushPromises();
    const cached = await readCachedMessages(partitionKey);

    expect(cached).toHaveLength(1);
    expect(cached[0]).toMatchObject({ message });
  });

  test("does not clear cache when items become empty on room switch", async () => {
    expect.hasAssertions();

    const dataStore = useDataStore();
    await mountCache();
    dataStore.items = [new StandardMessageEntity({ message, partitionKey, rowKey, userId })];
    await flushPromises();
    router.currentRoute.value.params.id = crypto.randomUUID();
    await flushPromises();
    const cached = await readCachedMessages(partitionKey);

    expect(cached).toHaveLength(1);
  });

  test("does not write to cache when room id is undefined", async () => {
    expect.hasAssertions();

    router.currentRoute.value.params.id = "";
    const dataStore = useDataStore();
    await mountCache();
    dataStore.items = [new StandardMessageEntity({ message, partitionKey, rowKey, userId })];
    await flushPromises();
    const cached = await readCachedMessages(partitionKey);

    expect(cached).toHaveLength(0);
  });

  test("populates store from cache when switching rooms offline", async () => {
    expect.hasAssertions();

    const secondPartitionKey = crypto.randomUUID();
    await writeCachedMessages(secondPartitionKey, [
      new StandardMessageEntity({ message: " ", partitionKey: secondPartitionKey, rowKey, userId }),
    ]);
    goOffline();
    const dataStore = useDataStore();
    await mountCache();
    router.currentRoute.value.params.id = secondPartitionKey;
    await flushPromises();

    expect(dataStore.items).toHaveLength(1);
    expect(dataStore.items[0]).toMatchObject({ message: " " });
  });

  test("does not populate store from cache when switching rooms online", async () => {
    expect.hasAssertions();

    const secondPartitionKey = crypto.randomUUID();
    await writeCachedMessages(secondPartitionKey, [
      new StandardMessageEntity({ message: " ", partitionKey: secondPartitionKey, rowKey, userId }),
    ]);
    goOnline();
    const dataStore = useDataStore();
    await mountCache();
    router.currentRoute.value.params.id = secondPartitionKey;
    await flushPromises();

    expect(dataStore.items).toHaveLength(0);
  });

  test("does not populate store if room changed during async read", async () => {
    expect.hasAssertions();

    await writeCachedMessages(partitionKey, [new StandardMessageEntity({ message, partitionKey, rowKey, userId })]);
    goOffline();
    const dataStore = useDataStore();
    router.currentRoute.value.params.id = crypto.randomUUID();
    await mountCache();
    router.currentRoute.value.params.id = partitionKey;
    router.currentRoute.value.params.id = crypto.randomUUID();
    await flushPromises();

    expect(dataStore.items).toHaveLength(0);
  });
});
