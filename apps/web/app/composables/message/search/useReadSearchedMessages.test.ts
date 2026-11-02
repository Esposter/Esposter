// @vitest-environment nuxt
import type { Filter, MessageEntity } from "@esposter/db-schema";
import type { MockInstance } from "vitest";

import { useReadSearchedMessages } from "@/composables/message/search/useReadSearchedMessages";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { createUser } from "@/services/message/user/createUser.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useSearchMessageStore } from "@/store/message/search";
import { useSearchHistoryStore } from "@/store/message/search/history";
import { createMessageEntity, FilterType, MessageType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, assert, describe, expect, test, vi } from "vitest";

describe(useReadSearchedMessages, () => {
  const { trpcMsw } = setupMswTrpc();
  let count: Ref<number>;
  let isSearching: Ref<boolean>;
  let items: Ref<MessageEntity[]>;
  let page: Ref<number>;
  let searchQuery: Ref<string>;
  let selectedFilters: Ref<Filter[]>;
  let createSearchHistory: MockInstance<ReturnType<typeof useSearchHistoryStore>["createSearchHistory"]>;
  let readSearchedMessages: ReturnType<typeof useReadSearchedMessages>;
  const roomId = crypto.randomUUID();
  const newCount = 1;
  const otherRoomId = crypto.randomUUID();
  const otherRoomPage = 3;
  const roomPage = 2;
  const query = "a";
  const pendingFilter = { type: FilterType.Has, value: "" };
  const filter = { type: FilterType.Pinned, value: false };
  const latestQuery = "latest";

  const mountRead = async () => {
    await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          setCurrentRoomId(roomId);
          const searchMessageStore = useSearchMessageStore();
          ({ count, isSearching, items, page, searchQuery, selectedFilters } = storeToRefs(searchMessageStore));
          // Each room's page starts at its own value, so a page written into the wrong slice is visible
          setCurrentRoomId(otherRoomId);
          page.value = otherRoomPage;
          setCurrentRoomId(roomId);
          page.value = roomPage;
          const searchHistoryStore = useSearchHistoryStore();
          createSearchHistory = vi.spyOn(searchHistoryStore, "createSearchHistory").mockResolvedValue();
          readSearchedMessages = useReadSearchedMessages();
        },
      }),
    );
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Each room owns its own result slice, and the totals, the page and the history entry a search writes back are
  // As much a part of that slice as the rows — switching rooms mid-flight must not hand the new room the previous
  // Room's total, nor drop the history entry that search earned
  test("files a search's totals, page and history under the room it was issued for", async () => {
    expect.hasAssertions();

    const { promise: searchGate, resolve: releaseSearch } = Promise.withResolvers<void>();
    trpcMsw.message.searchMessages.query(async () => {
      await searchGate;
      return { count: newCount, data: { hasMore: false, items: [] } };
    });
    await mountRead();
    searchQuery.value = query;
    const pendingSearch = readSearchedMessages();
    // The search is issued a microtask after the call, so let it go out before the room moves
    await flushPromises();
    // The user opens another room before the search comes back
    setCurrentRoomId(otherRoomId);
    releaseSearch();
    await pendingSearch;

    expect(count.value).toBe(0);
    expect(page.value).toBe(otherRoomPage);

    setCurrentRoomId(roomId);

    expect(count.value).toBe(newCount);
    expect(page.value).toBe(1);
    expect(createSearchHistory).toHaveBeenCalledTimes(1);
  });

  // Pending belongs to the search that raised it, not to the composable: the paginator hands every read the same
  // Finalizer, so two searches overlapping across a room switch would have the first to land clear the second's
  // Flag and leave its own room rendering as loading forever
  test("clears only the pending flag of the search that settles", async () => {
    expect.hasAssertions();

    const { promise: roomSearch, resolve: releaseRoomSearch } = Promise.withResolvers<void>();
    const { promise: otherRoomSearch, resolve: releaseOtherRoomSearch } = Promise.withResolvers<void>();
    const { promise: isRoomSearchReached, resolve: onRoomSearchReached } = Promise.withResolvers<void>();
    const { promise: isOtherRoomSearchReached, resolve: onOtherRoomSearchReached } = Promise.withResolvers<void>();
    trpcMsw.message.searchMessages.query(async ({ input }) => {
      if (input.roomId === roomId) {
        onRoomSearchReached();
        await roomSearch;
      } else {
        onOtherRoomSearchReached();
        await otherRoomSearch;
      }
      return { count: newCount, data: { hasMore: false, items: [] } };
    });
    await mountRead();
    searchQuery.value = query;
    const pendingRoomSearch = readSearchedMessages();
    // Let the search reach its resolver before the room moves, so the next one is a request of its own
    await isRoomSearchReached;
    setCurrentRoomId(otherRoomId);
    searchQuery.value = query;
    const pendingOtherRoomSearch = readSearchedMessages();
    await isOtherRoomSearchReached;
    releaseRoomSearch();
    await pendingRoomSearch;

    expect(isSearching.value).toBe(true);

    setCurrentRoomId(roomId);

    expect(isSearching.value).toBe(false);

    setCurrentRoomId(otherRoomId);
    releaseOtherRoomSearch();
    await pendingOtherRoomSearch;

    expect(isSearching.value).toBe(false);
  });

  // An empty read raises no flag of its own, and the search it supersedes skips clearing the one it raised once aborted,
  // So the empty read is what clears it — or the room would render as searching for good
  test("clears the pending flag of a search that an empty read supersedes", async () => {
    expect.hasAssertions();

    const { promise: searchGate, resolve: releaseSearch } = Promise.withResolvers<void>();
    trpcMsw.message.searchMessages.query(async () => {
      await searchGate;
      return { count: newCount, data: { hasMore: false, items: [] } };
    });
    await mountRead();
    searchQuery.value = query;
    const pendingSearch = readSearchedMessages();
    await flushPromises();

    expect(isSearching.value).toBe(true);

    searchQuery.value = "";
    await readSearchedMessages();

    expect(isSearching.value).toBe(false);

    releaseSearch();
    await pendingSearch;
  });

  // The schema refuses a search with nothing in it, so a read that would send one issues no request at all — the
  // Field clears itself on blur, and every surface that can search would otherwise have to remember that
  test("issues no request for a search with neither text nor a valued filter", async () => {
    expect.hasAssertions();

    const searchMessages = vi.fn<() => void>();
    trpcMsw.message.searchMessages.query(() => {
      searchMessages();
      return { count: newCount, data: { hasMore: false, items: [] } };
    });
    await mountRead();
    selectedFilters.value = [pendingFilter];
    searchQuery.value = "";
    await readSearchedMessages();

    expect(searchMessages).not.toHaveBeenCalled();
    expect(createSearchHistory).not.toHaveBeenCalled();
  });

  // A chip the user added by typing its keyword has no value until a picker gives it one, and the search input
  // Schema rejects that "" — so a read that sends it fails outright rather than searching on the text the user
  // Typed. Neither the search nor the history entry it earns carries one
  test("searches on the typed text with a filter still waiting for its value left out", async () => {
    expect.hasAssertions();

    const searchMessages = vi.fn<(filters: Filter[]) => void>();
    trpcMsw.message.searchMessages.query(({ input }) => {
      // The wire input types filters as optional because the schema defaults it, but this read always sends it
      assert.exists(input.filters);
      searchMessages(input.filters);
      return { count: newCount, data: { hasMore: false, items: [] } };
    });
    await mountRead();
    selectedFilters.value = [pendingFilter, filter];
    searchQuery.value = query;
    await readSearchedMessages();

    expect(searchMessages).toHaveBeenCalledExactlyOnceWith([filter]);
    expect(createSearchHistory).toHaveBeenCalledExactlyOnceWith({ filters: [filter], query, roomId });
  });

  // A search answered after a newer one was issued is cancelled by it, so the older response never replaces the results
  // The newer search has already filed
  test("drops the response of a search a newer search superseded", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const { promise: isStaleResponseReleased, resolve: releaseStaleResponse } = Promise.withResolvers<void>();
    const staleMessage = createMessageEntity({ message: query, roomId, type: MessageType.Message, userId });
    const latestMessage = createMessageEntity({ message: latestQuery, roomId, type: MessageType.Message, userId });
    trpcMsw.message.searchMessages.query(async ({ input }) => {
      if (input.query !== query) return { count: newCount, data: { hasMore: false, items: [latestMessage] } };

      await isStaleResponseReleased;
      return { count: newCount, data: { hasMore: false, items: [staleMessage] } };
    });
    trpcMsw.room.readUsersByIds.query(() => []);
    await mountRead();
    searchQuery.value = query;
    const staleSearch = readSearchedMessages();
    searchQuery.value = latestQuery;
    await readSearchedMessages();
    releaseStaleResponse();
    await staleSearch;

    expect(items.value).toStrictEqual([latestMessage]);
  });

  // A hit is drawn only once its author is known, so the authors the hits name are read with the results, as a room's
  // Messages read theirs — a member the reader has not loaded yet must not make the hit vanish
  test("reads each hit's author with the results, so a hit from a member not yet loaded is drawn", async () => {
    expect.hasAssertions();

    const author = createUser();
    const hit = createMessageEntity({ roomId, type: MessageType.Message, userId: author.id });
    trpcMsw.message.searchMessages.query(() => ({ count: newCount, data: { hasMore: false, items: [hit] } }));
    trpcMsw.room.readUsersByIds.query(() => [{ ...author, displayName: "displayName", isMember: true }]);
    await mountRead();
    searchQuery.value = query;
    await readSearchedMessages();

    expect(useCreator(() => hit).value?.id).toBe(author.id);
  });
});
