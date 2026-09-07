// @vitest-environment nuxt
import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { VueWrapper } from "@vue/test-utils";

import { flushCache } from "@/composables/cache/indexedDb/flushCache.test";
import { useCursorPaginationCache } from "@/composables/cache/indexedDb/useCursorPaginationCache";
import { useOffsetPaginationCache } from "@/composables/cache/indexedDb/useOffsetPaginationCache";
import { goOffline, goOnline } from "@/composables/shared/network.test";
import { MessageIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MessageIndexedDbStoreConfiguration";
import { resetIndexedDb } from "@/services/cache/indexedDb/openIndexedDb";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";
import { useAlertStore } from "@/store/alert";
import { getMockSession } from "@@/server/trpc/context.test";
import { StandardMessageEntity } from "@esposter/db-schema";
import { noop, takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

type MessageValue = IndexedDbDatabaseSchema[IndexedDbStoreName.Messages]["value"];

interface PaginationCacheVariant {
  name: string;
  useCache: (
    getSlice: (partitionKey: string) => TestSlice,
    partitionKey: Ref<string>,
    onHydrate?: () => Promise<void>,
  ) => void;
}

interface TestSlice {
  initializeItems: (data: { items: MessageValue[] }) => void;
  isLoaded: Ref<boolean>;
  items: Ref<MessageValue[]>;
}

describe.each<PaginationCacheVariant>([
  {
    name: useCursorPaginationCache.name,
    useCache: (getSlice, partitionKey, onHydrate) => {
      useCursorPaginationCache({
        configuration: MessageIndexedDbStoreConfiguration,
        getSlice: (key) => {
          const { initializeItems, isLoaded, items } = getSlice(key);
          return { initializeCursorPaginationData: initializeItems, isLoaded, items };
        },
        onHydrate,
        partitionKey,
      });
    },
  },
  {
    name: useOffsetPaginationCache.name,
    useCache: (getSlice, partitionKey, onHydrate) => {
      useOffsetPaginationCache({
        configuration: MessageIndexedDbStoreConfiguration,
        getSlice: (key) => {
          const { initializeItems, isLoaded, items } = getSlice(key);
          return { initializeOffsetPaginationData: initializeItems, isLoaded, items };
        },
        onHydrate,
        partitionKey,
      });
    },
  },
])("$name", ({ useCache }) => {
  let wrapper: VueWrapper;
  const partitionKeyRef = ref("");
  // Keyed like the store the harness stands in for, so a read for one partition landing after a switch is
  // Visible as rows in the wrong slice rather than hidden behind a single shared list
  const sliceMap = new Map<string, TestSlice>();
  const getTestSlice = (key: string): TestSlice => {
    const existingSlice = sliceMap.get(key);
    if (existingSlice) return existingSlice;

    const sliceIsLoaded = ref(false);
    const sliceItems = ref<MessageValue[]>([]);
    // The store that performed the load owns readiness per partition; the harness drives it the way a store
    // Would — true once a read for that partition has landed, false again on a switch onto one that has not
    const slice: TestSlice = {
      initializeItems: (data) => {
        sliceItems.value = data.items;
        sliceIsLoaded.value = true;
      },
      isLoaded: sliceIsLoaded,
      items: sliceItems,
    };
    sliceMap.set(key, slice);
    return slice;
  };
  // The current partition's view of the two, which is what a store's ambient refs are and what every test below
  // Drives — the keyed slices exist so one test can name a partition the reader has left
  const items = computed({
    get: () => getTestSlice(partitionKeyRef.value).items.value,
    set: (newItems) => {
      getTestSlice(partitionKeyRef.value).items.value = newItems;
    },
  });
  const isLoaded = computed({
    get: () => getTestSlice(partitionKeyRef.value).isLoaded.value,
    set: (newIsLoaded) => {
      getTestSlice(partitionKeyRef.value).isLoaded.value = newIsLoaded;
    },
  });
  const partitionKey = crypto.randomUUID();
  const secondPartitionKey = crypto.randomUUID();
  const rowKey = crypto.randomUUID();
  const message = "message";
  const secondMessage = "secondMessage";
  const createMessageEntity = (entityPartitionKey: string = partitionKey, entityMessage: string = message) =>
    new StandardMessageEntity({
      message: entityMessage,
      partitionKey: entityPartitionKey,
      rowKey,
      userId: getMockSession().user.id,
    });
  // The load a store performs writes the rows and records readiness together, so the harness does both at once.
  // The partition is named where a load happens before the key is on the ref — a store that already held rows
  // When this composable mounted
  const loadItems = (newItems: MessageValue[], key: string = partitionKeyRef.value) => {
    const slice = getTestSlice(key);
    slice.items.value = newItems;
    slice.isLoaded.value = true;
  };
  const mountCache = async (initialKey: string = partitionKey, onHydrate?: () => Promise<void>) => {
    partitionKeyRef.value = initialKey;
    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          useCache(getTestSlice, partitionKeyRef, onHydrate);
        },
      }),
    );
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    // Emptied rather than dropped: `items` and `isLoaded` below are computeds over whichever slice the key
    // Names, and a plain Map going away is not a reactive change — they would keep serving the last test's
    // Slice until something else invalidated them
    for (const slice of sliceMap.values()) {
      slice.isLoaded.value = false;
      slice.items.value = [];
    }
    goOffline();
  });

  afterEach(async () => {
    wrapper?.unmount();
    vi.restoreAllMocks();
    await resetIndexedDb();
  });

  test("persists items to cache when items change", async () => {
    expect.hasAssertions();

    await mountCache();
    loadItems([createMessageEntity()]);
    await flushCache();
    const cachedItems = await readIndexedDb(MessageIndexedDbStoreConfiguration, partitionKey);

    expect(cachedItems).toHaveLength(1);
    expect(takeOne(cachedItems).message).toStrictEqual(message);
  });

  test("clears cache when items are emptied after being loaded", async () => {
    expect.hasAssertions();

    await mountCache();
    loadItems([createMessageEntity()]);
    await flushCache();
    items.value = [];
    await flushCache();
    const cachedItems = await readIndexedDb(MessageIndexedDbStoreConfiguration, partitionKey);

    expect(cachedItems).toHaveLength(0);
  });

  // The rows a partition holds are its own only once a load has said so, and a load that lands empty says so
  // Just as loudly as one that lands full — nothing in the list changes, so readiness is the only signal that
  // The previous session's rows now describe a partition the server has emptied
  test("clears cache when a load lands empty", async () => {
    expect.hasAssertions();

    await writeIndexedDb(MessageIndexedDbStoreConfiguration, [createMessageEntity()], partitionKey);
    goOnline();
    await mountCache();
    isLoaded.value = true;
    await flushCache();
    const cachedItems = await readIndexedDb(MessageIndexedDbStoreConfiguration, partitionKey);

    expect(cachedItems).toHaveLength(0);
  });

  test("does not clear cache when items are empty for a partition that has not loaded", async () => {
    expect.hasAssertions();

    await writeIndexedDb(
      MessageIndexedDbStoreConfiguration,
      [createMessageEntity(secondPartitionKey)],
      secondPartitionKey,
    );
    goOnline();
    await mountCache();
    loadItems([createMessageEntity()]);
    await flushCache();
    partitionKeyRef.value = secondPartitionKey;
    items.value = [];
    isLoaded.value = false;
    await flushCache();
    const cachedItems = await readIndexedDb(MessageIndexedDbStoreConfiguration, secondPartitionKey);

    expect(cachedItems).toHaveLength(1);
  });

  // Readiness travels with the slice, so a revisit that has not re-read is as unloaded as a first visit — the
  // Empty list it starts from must not be taken for a partition that emptied
  test("does not clear cache when a revisited partition is empty again", async () => {
    expect.hasAssertions();

    goOnline();
    await mountCache();
    loadItems([createMessageEntity()]);
    await flushCache();
    partitionKeyRef.value = secondPartitionKey;
    await flushCache();
    partitionKeyRef.value = partitionKey;
    // The slice was reset while the reader was away, so the revisit starts unloaded and empty exactly as a
    // First visit does — and the rows the previous session cached are still the only ones this partition has
    isLoaded.value = false;
    items.value = [];
    await flushCache();
    const cachedItems = await readIndexedDb(MessageIndexedDbStoreConfiguration, partitionKey);

    expect(cachedItems).toHaveLength(1);
  });

  test("does not clear cache when items become empty on partition key switch", async () => {
    expect.hasAssertions();

    await mountCache();
    loadItems([createMessageEntity()]);
    await flushCache();
    partitionKeyRef.value = secondPartitionKey;
    isLoaded.value = false;
    await flushCache();
    const cachedItems = await readIndexedDb(MessageIndexedDbStoreConfiguration, partitionKey);

    expect(cachedItems).toHaveLength(1);
  });

  test("does not write to cache when partition key is empty", async () => {
    expect.hasAssertions();

    await mountCache("");
    loadItems([createMessageEntity()]);
    await flushCache();
    const cachedItems = await readIndexedDb(MessageIndexedDbStoreConfiguration, partitionKey);

    expect(cachedItems).toHaveLength(0);
  });

  // The cache is bookkeeping the user never asked for, so a browser that refuses the write — quota reached,
  // Private mode, a blocked database — is logged and nothing more. Alerting would fire a toast per incoming
  // Message and per scroll page for something the user did not do
  test("logs rather than alerts when the cache write fails", async () => {
    expect.hasAssertions();

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(noop);
    const error = new Error(message);
    vi.spyOn(indexedDB, "open").mockImplementation(() => {
      throw error;
    });
    await mountCache();
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    loadItems([createMessageEntity()]);
    await flushCache();

    expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    expect(alerts.value).toHaveLength(0);
  });

  test("populates store from cache when switching partition key offline", async () => {
    expect.hasAssertions();

    await writeIndexedDb(
      MessageIndexedDbStoreConfiguration,
      [createMessageEntity(secondPartitionKey)],
      secondPartitionKey,
    );
    await mountCache();
    partitionKeyRef.value = secondPartitionKey;
    await flushCache();

    expect(items.value).toHaveLength(1);
    expect(takeOne(items.value).message).toStrictEqual(message);
  });

  // The cold start is the flagship offline case, not an edge case: the room id is already on the route when the
  // Layout mounts, so the partition key never changes and a change-only watcher would never hydrate at all
  test("populates store from cache when the partition key is already set on mount", async () => {
    expect.hasAssertions();

    await writeIndexedDb(MessageIndexedDbStoreConfiguration, [createMessageEntity()], partitionKey);
    await mountCache();
    await flushCache();

    expect(items.value).toHaveLength(1);
    expect(takeOne(items.value).message).toStrictEqual(message);
  });

  // Readiness is per-partition rather than a reading of the list, so a caller whose rows have not yet been
  // Swapped out at the moment of the switch still hydrates instead of taking them for the new partition's own
  test("populates store from cache when the previous partition's items are still loaded", async () => {
    expect.hasAssertions();

    await writeIndexedDb(
      MessageIndexedDbStoreConfiguration,
      [createMessageEntity(secondPartitionKey, secondMessage)],
      secondPartitionKey,
    );
    await mountCache();
    loadItems([createMessageEntity()]);
    await flushCache();
    partitionKeyRef.value = secondPartitionKey;
    isLoaded.value = false;
    await flushCache();

    expect(items.value).toHaveLength(1);
    expect(takeOne(items.value).message).toStrictEqual(secondMessage);
  });

  // Readiness outlives this composable because the list it describes does. A layout torn down and rebuilt over
  // A Pinia list that survived it hydrates the capped cache page over a room the user has scrolled back
  // Through, discarding their scrollback with no way to refetch it offline
  test("does not populate store from cache over a partition that is already loaded", async () => {
    expect.hasAssertions();

    await writeIndexedDb(
      MessageIndexedDbStoreConfiguration,
      [createMessageEntity(partitionKey, secondMessage)],
      partitionKey,
    );
    // The list and its readiness are what the store already held when this composable mounted
    loadItems([createMessageEntity()], partitionKey);
    await mountCache();
    await flushCache();

    expect(items.value).toHaveLength(1);
    expect(takeOne(items.value).message).toStrictEqual(message);
  });

  // Losing the network mid-session leaves a partition whose load never landed with nothing on screen and no way
  // To fetch it, so connectivity has to trigger hydration on its own rather than wait for a switch
  test("populates store from cache when the network drops without a partition key change", async () => {
    expect.hasAssertions();

    await writeIndexedDb(MessageIndexedDbStoreConfiguration, [createMessageEntity()], partitionKey);
    goOnline();
    await mountCache();
    await flushCache();

    expect(items.value).toHaveLength(0);

    goOffline();
    await flushCache();

    expect(items.value).toHaveLength(1);
    expect(takeOne(items.value).message).toStrictEqual(message);
  });

  test("does not populate store from cache when switching partition key online", async () => {
    expect.hasAssertions();

    await writeIndexedDb(
      MessageIndexedDbStoreConfiguration,
      [createMessageEntity(secondPartitionKey)],
      secondPartitionKey,
    );
    goOnline();
    await mountCache();
    partitionKeyRef.value = secondPartitionKey;
    await flushCache();

    expect(items.value).toHaveLength(0);
  });

  test("does not populate store if partition key changed during async read", async () => {
    expect.hasAssertions();

    await writeIndexedDb(MessageIndexedDbStoreConfiguration, [createMessageEntity()], partitionKey);
    await mountCache(crypto.randomUUID());
    partitionKeyRef.value = partitionKey;
    partitionKeyRef.value = crypto.randomUUID();
    await flushCache();

    expect(items.value).toHaveLength(0);
  });
  // A hydrate lands after its own read, so the rows belong to the partition that was read rather than to
  // Whichever one the reader switched to while it was in flight — read against a single shared list neither
  // Half of that is visible

  test("hydrates the partition its read was issued for rather than the current one", async () => {
    expect.hasAssertions();

    await writeIndexedDb(MessageIndexedDbStoreConfiguration, [createMessageEntity()], partitionKey);
    await mountCache();
    partitionKeyRef.value = secondPartitionKey;
    await flushCache();

    expect(getTestSlice(partitionKey).items.value).toHaveLength(1);
    expect(getTestSlice(secondPartitionKey).items.value).toHaveLength(0);
  });
});
