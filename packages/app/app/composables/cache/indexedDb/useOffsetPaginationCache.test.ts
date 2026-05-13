// @vitest-environment nuxt
import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { VueWrapper } from "@vue/test-utils";

import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import { useOffsetPaginationCache } from "@/composables/cache/indexedDb/useOffsetPaginationCache";
import { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
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

describe(useOffsetPaginationCache, () => {
  let wrapper: VueWrapper;
  let flush: () => Promise<void>;
  const items = ref<IndexedDbDatabaseSchema[IndexedDbStoreName.Messages]["value"][]>([]);
  const partitionKeyRef = ref("");
  const partitionKey = crypto.randomUUID();
  const secondPartitionKey = crypto.randomUUID();
  const rowKey = crypto.randomUUID();
  const message = "message";
  const offsetPaginationData = ref(
    new OffsetPaginationData<IndexedDbDatabaseSchema[IndexedDbStoreName.Messages]["value"]>(),
  );
  const initializeOffsetPaginationData = (
    data: OffsetPaginationData<IndexedDbDatabaseSchema[IndexedDbStoreName.Messages]["value"]>,
  ) => {
    offsetPaginationData.value = data;
    items.value = data.items;
  };
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
  const mountCache = async (initialKey: string = partitionKey) => {
    partitionKeyRef.value = initialKey;
    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          ({ flush } = useOffsetPaginationCache({
            configuration: MessageIndexedDbStoreConfiguration,
            initializeOffsetPaginationData,
            items,
            partitionKey: partitionKeyRef,
          }));
        },
      }),
    );
  };

  beforeEach(() => {
    items.value = [];
    offsetPaginationData.value = new OffsetPaginationData();
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
