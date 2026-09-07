// @vitest-environment nuxt
import type { MessageEntity } from "@esposter/db-schema";
import type { VueWrapper } from "@vue/test-utils";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { flushCache } from "@/composables/cache/indexedDb/flushCache.test";
import { goOffline } from "@/composables/shared/network.test";
import { MessageIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MessageIndexedDbStoreConfiguration";
import { resetIndexedDb } from "@/services/cache/indexedDb/openIndexedDb";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { useDataStore } from "@/store/message/data";
import { getMockSession } from "@@/server/trpc/context.test";
import { StandardMessageEntity } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useMessageCache, () => {
  let wrapper: VueWrapper;
  let items: ComputedRef<readonly MessageEntity[]>;
  let getSlice: ReturnType<typeof useDataStore>["getSlice"];
  const partitionKey = crypto.randomUUID();
  const secondPartitionKey = crypto.randomUUID();
  const rowKey = crypto.randomUUID();
  const message = "message";
  // The store refs are captured from inside the mounted component's scope because mountSuspended creates its own
  // Context
  const mountCache = async (initialRouteId: string = partitionKey) => {
    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          setCurrentRoomId(initialRouteId);
          const dataStore = useDataStore();
          ({ items } = storeToRefs(dataStore));
          ({ getSlice } = dataStore);
          useMessageCache();

          onUnmounted(() => {
            getSlice(initialRouteId).items.value = [];
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

  // The cache lifecycle itself belongs to usePaginationCache and is tested there for both variants. This suite
  // Owns only what is specific to messages: the getWriteItems filter below, and the wiring — the route id it
  // Takes as its partition key and the store hook it hydrates through
  test("does not persist loading messages", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await mountCache();
    const loadedData = new CursorPaginationData<MessageEntity>();
    loadedData.items = [new StandardMessageEntity({ isLoading: true, message, partitionKey, rowKey, userId })];
    // Through the store hook a read would use, so the room counts as loaded — an unloaded room persists nothing
    // At all, which would leave the filter untested
    getSlice(partitionKey).initializeCursorPaginationData(loadedData);
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
    setCurrentRoomId(secondPartitionKey);
    await flushCache();

    expect(items.value).toHaveLength(1);
    expect(takeOne(items.value).message).toStrictEqual(message);
  });
});
