// @vitest-environment nuxt
import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { VueWrapper } from "@vue/test-utils";

import { useCursorPaginationCache } from "@/composables/cache/indexedDb/useCursorPaginationCache";
import { useOffsetPaginationCache } from "@/composables/cache/indexedDb/useOffsetPaginationCache";
import { goOffline, goOnline } from "@/composables/shared/network.test";
import { MessageIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MessageIndexedDbStoreConfiguration";
import { resetIndexedDb } from "@/services/cache/indexedDb/openIndexedDb";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";
import { getMockSession } from "@@/server/trpc/context.test";
import { StandardMessageEntity } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

type MessageValue = IndexedDbDatabaseSchema[IndexedDbStoreName.Messages]["value"];

interface PaginationCacheVariant {
  name: string;
  useCache: (
    initializeItems: (data: { items: MessageValue[] }) => void,
    items: Ref<MessageValue[]>,
    partitionKey: Ref<string>,
    onHydrate?: () => Promise<void>,
  ) => { flush: () => Promise<void> };
}

describe.each<PaginationCacheVariant>([
  {
    name: useCursorPaginationCache.name,
    useCache: (initializeItems, items, partitionKey, onHydrate) =>
      useCursorPaginationCache({
        configuration: MessageIndexedDbStoreConfiguration,
        initializeCursorPaginationData: initializeItems,
        items,
        onHydrate,
        partitionKey,
      }),
  },
  {
    name: useOffsetPaginationCache.name,
    useCache: (initializeItems, items, partitionKey, onHydrate) =>
      useOffsetPaginationCache({
        configuration: MessageIndexedDbStoreConfiguration,
        initializeOffsetPaginationData: initializeItems,
        items,
        onHydrate,
        partitionKey,
      }),
  },
])("$name", ({ useCache }) => {
  let wrapper: VueWrapper;
  let flush: () => Promise<void>;
  const items = ref<MessageValue[]>([]);
  const partitionKeyRef = ref("");
  const partitionKey = crypto.randomUUID();
  const secondPartitionKey = crypto.randomUUID();
  const rowKey = crypto.randomUUID();
  const message = "message";
  const initializeItems = (data: { items: MessageValue[] }) => {
    items.value = data.items;
  };
  const flushCache = async () => {
    await flushPromises();
    await flush();
  };
  const mountCache = async (initialKey: string = partitionKey, onHydrate?: () => Promise<void>) => {
    partitionKeyRef.value = initialKey;
    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          ({ flush } = useCache(initializeItems, items, partitionKeyRef, onHydrate));
        },
      }),
    );
  };

  beforeEach(() => {
    items.value = [];
    goOffline();
  });

  afterEach(async () => {
    wrapper?.unmount();
    vi.restoreAllMocks();
    await resetIndexedDb();
  });

  test("persists items to cache when items change", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await mountCache();
    items.value = [new StandardMessageEntity({ message, partitionKey, rowKey, userId })];
    await flushCache();
    const cachedItems = await readIndexedDb(MessageIndexedDbStoreConfiguration, partitionKey);

    expect(cachedItems).toHaveLength(1);
    expect(takeOne(cachedItems).message).toStrictEqual(message);
  });

  test("clears cache when items are emptied after being loaded", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await mountCache();
    items.value = [new StandardMessageEntity({ message, partitionKey, rowKey, userId })];
    await flushCache();
    items.value = [];
    await flushCache();
    const cachedItems = await readIndexedDb(MessageIndexedDbStoreConfiguration, partitionKey);

    expect(cachedItems).toHaveLength(0);
  });

  test("does not clear cache when items are empty for a partition that has not loaded", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await writeIndexedDb(
      MessageIndexedDbStoreConfiguration,
      [new StandardMessageEntity({ message, partitionKey: secondPartitionKey, rowKey, userId })],
      secondPartitionKey,
    );
    goOnline();
    await mountCache();
    items.value = [new StandardMessageEntity({ message, partitionKey, rowKey, userId })];
    await flushCache();
    partitionKeyRef.value = secondPartitionKey;
    items.value = [];
    await flushCache();
    const cachedItems = await readIndexedDb(MessageIndexedDbStoreConfiguration, secondPartitionKey);

    expect(cachedItems).toHaveLength(1);
  });

  test("does not clear cache when items become empty on partition key switch", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await mountCache();
    items.value = [new StandardMessageEntity({ message, partitionKey, rowKey, userId })];
    await flushCache();
    partitionKeyRef.value = secondPartitionKey;
    await flushCache();
    const cachedItems = await readIndexedDb(MessageIndexedDbStoreConfiguration, partitionKey);

    expect(cachedItems).toHaveLength(1);
  });

  test("does not write to cache when partition key is empty", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await mountCache("");
    items.value = [new StandardMessageEntity({ message, partitionKey, rowKey, userId })];
    await flushCache();
    const cachedItems = await readIndexedDb(MessageIndexedDbStoreConfiguration, partitionKey);

    expect(cachedItems).toHaveLength(0);
  });

  test("populates store from cache when switching partition key offline", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await writeIndexedDb(
      MessageIndexedDbStoreConfiguration,
      [new StandardMessageEntity({ message, partitionKey: secondPartitionKey, rowKey, userId })],
      secondPartitionKey,
    );
    await mountCache();
    partitionKeyRef.value = secondPartitionKey;
    await flushCache();

    expect(items.value).toHaveLength(1);
    expect(takeOne(items.value).message).toStrictEqual(message);
  });

  test("does not populate store from cache when switching partition key online", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await writeIndexedDb(
      MessageIndexedDbStoreConfiguration,
      [new StandardMessageEntity({ message, partitionKey: secondPartitionKey, rowKey, userId })],
      secondPartitionKey,
    );
    goOnline();
    await mountCache();
    partitionKeyRef.value = secondPartitionKey;
    await flushCache();

    expect(items.value).toHaveLength(0);
  });

  // Each partition's cache is its own target, so the room the user is looking at now persists while a hydration
  // For the room they just left is still finishing
  test("writes a partition's cache while another partition's hydration is still running", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const thirdPartitionKey = crypto.randomUUID();
    const { promise, resolve: resolveHydrate }: PromiseWithResolvers<void> = Promise.withResolvers();
    await writeIndexedDb(
      MessageIndexedDbStoreConfiguration,
      [new StandardMessageEntity({ message, partitionKey: secondPartitionKey, rowKey, userId })],
      secondPartitionKey,
    );
    await mountCache(partitionKey, () => promise);
    partitionKeyRef.value = secondPartitionKey;
    await flushPromises();
    partitionKeyRef.value = thirdPartitionKey;
    items.value = [new StandardMessageEntity({ message, partitionKey: thirdPartitionKey, rowKey, userId })];

    await vi.waitFor(async () => {
      expect(await readIndexedDb(MessageIndexedDbStoreConfiguration, thirdPartitionKey)).toHaveLength(1);
    });

    resolveHydrate();
    await flushCache();
  });

  test("does not populate store if partition key changed during async read", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await writeIndexedDb(
      MessageIndexedDbStoreConfiguration,
      [new StandardMessageEntity({ message, partitionKey, rowKey, userId })],
      partitionKey,
    );
    await mountCache(crypto.randomUUID());
    partitionKeyRef.value = partitionKey;
    partitionKeyRef.value = crypto.randomUUID();
    await flushCache();

    expect(items.value).toHaveLength(0);
  });
});
