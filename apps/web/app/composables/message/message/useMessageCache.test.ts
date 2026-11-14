// @vitest-environment nuxt
import type { ClientMessage } from "@/models/message/ClientMessage";

import { getMockSession } from "#server/trpc/context.test";
import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { flushCache } from "@/composables/cache/indexedDb/flushCache.test";
import { goOffline } from "@/composables/shared/network.test";
import { MessageIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MessageIndexedDbStoreConfiguration";
import { resetIndexedDb } from "@/services/cache/indexedDb/openIndexedDb";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";
import { createOptimisticMessage } from "@/services/message/createOptimisticMessage";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { useDataStore } from "@/store/message/data";
import { MessageType } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useMessageCache, () => {
  let items: ComputedRef<readonly ClientMessage[]>;
  let getSlice: ReturnType<typeof useDataStore>["getSlice"];
  const roomId = crypto.randomUUID();
  const secondRoomId = crypto.randomUUID();
  const message = "message";
  const secondMessage = "second message";
  // A room's messages are numbered from one within the room, so two rooms hold a message under the same integer id
  const sharedMessageId = 1;
  // The store refs are captured from inside the mounted component's scope because mountSuspended creates its own
  // Context
  const mountCache = async (initialRouteId: string = roomId) => {
    await mountSuspended(
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
    const loadedData = new CursorPaginationData<ClientMessage>();
    loadedData.items = [createOptimisticMessage({ message, roomId, type: MessageType.Message }, userId)];
    // Through the store hook a read would use, so the room counts as loaded — an unloaded room persists nothing
    // At all, which would leave the filter untested
    getSlice(roomId).initializeCursorPaginationData(loadedData);
    await flushCache();
    const cachedMessages = await readIndexedDb(MessageIndexedDbStoreConfiguration, roomId);

    expect(cachedMessages).toHaveLength(0);
  });

  test("populates store from cache when switching rooms offline", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await writeIndexedDb(
      MessageIndexedDbStoreConfiguration,
      [createOptimisticMessage({ message, roomId: secondRoomId, type: MessageType.Message }, userId)],
      secondRoomId,
    );
    await mountCache();
    setCurrentRoomId(secondRoomId);
    await flushCache();

    expect(items.value).toHaveLength(1);
    expect(takeOne(items.value).message).toStrictEqual(message);
  });

  // A message is keyed by its room and its integer id together, so the same id in two rooms caches as two messages
  test("caches the same integer id in two rooms apart", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await writeIndexedDb(
      MessageIndexedDbStoreConfiguration,
      [{ ...createOptimisticMessage({ message, roomId, type: MessageType.Message }, userId), id: sharedMessageId }],
      roomId,
    );
    await writeIndexedDb(
      MessageIndexedDbStoreConfiguration,
      [
        {
          ...createOptimisticMessage(
            { message: secondMessage, roomId: secondRoomId, type: MessageType.Message },
            userId,
          ),
          id: sharedMessageId,
        },
      ],
      secondRoomId,
    );
    const cachedMessages = await readIndexedDb(MessageIndexedDbStoreConfiguration, roomId);
    const cachedSecondMessages = await readIndexedDb(MessageIndexedDbStoreConfiguration, secondRoomId);

    expect(cachedMessages.map(({ message: text }) => text)).toStrictEqual([message]);
    expect(cachedSecondMessages.map(({ message: text }) => text)).toStrictEqual([secondMessage]);
  });
});
