// @vitest-environment nuxt
import type { Filter } from "@esposter/db-schema";
import type { VueWrapper } from "@vue/test-utils";
import type { MockInstance } from "vitest";

import { useReadSearchedMessages } from "@/composables/message/search/useReadSearchedMessages";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useSearchMessageStore } from "@/store/message/search";
import { useSearchHistoryStore } from "@/store/message/search/history";
import { FilterType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, assert, describe, expect, test, vi } from "vitest";

describe(useReadSearchedMessages, () => {
  const server = setupMswTrpc();
  let wrapper: VueWrapper;
  let count: Ref<number>;
  let isSearching: Ref<boolean>;
  let page: Ref<number>;
  let searchQuery: Ref<string>;
  let selectedFilters: Ref<Filter[]>;
  let createSearchHistory: MockInstance<ReturnType<typeof useSearchHistoryStore>["createSearchHistory"]>;
  let readSearchedMessages: ReturnType<typeof useReadSearchedMessages>;
  const roomId = crypto.randomUUID();
  const newCount = 3;
  const otherRoomId = crypto.randomUUID();
  const otherRoomPage = 5;
  const roomPage = 2;
  const query = "a";
  const pendingFilter = { type: FilterType.Has, value: "" };
  const filter = { type: FilterType.Pinned, value: false };

  const mountRead = async () => {
    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          setCurrentRoomId(roomId);
          const searchMessageStore = useSearchMessageStore();
          ({ count, isSearching, page, searchQuery, selectedFilters } = storeToRefs(searchMessageStore));
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
    wrapper?.unmount();
    vi.restoreAllMocks();
  });

  // Each room owns its own result slice, and the totals, the page and the history entry a search writes back are
  // As much a part of that slice as the rows — switching rooms mid-flight must not hand the new room the previous
  // Room's total, nor drop the history entry that search earned
  test("files a search's totals, page and history under the room it was issued for", async () => {
    expect.hasAssertions();

    const { promise: searchPromise, resolve: releaseSearch } = Promise.withResolvers<void>();
    const searchGate = searchPromise;
    server.use(
      trpcMsw.message.searchMessages.query(async () => {
        await searchGate;
        return { count: newCount, data: { hasMore: false, items: [] } };
      }),
    );
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
    server.use(
      trpcMsw.message.searchMessages.query(async ({ input }) => {
        await (input.roomId === roomId ? roomSearch : otherRoomSearch);
        return { count: newCount, data: { hasMore: false, items: [] } };
      }),
    );
    await mountRead();
    searchQuery.value = query;
    const pendingRoomSearch = readSearchedMessages();
    // The search is issued a microtask after the call, so let it go out before the room moves
    await flushPromises();
    setCurrentRoomId(otherRoomId);
    searchQuery.value = query;
    const pendingOtherRoomSearch = readSearchedMessages();
    await flushPromises();
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

  // The schema refuses a search with nothing in it, so a read that would send one issues no request at all — the
  // Field clears itself on blur, and every surface that can search would otherwise have to remember that
  test("issues no request for a search with neither text nor a valued filter", async () => {
    expect.hasAssertions();

    const searchMessages = vi.fn<() => void>();
    server.use(
      trpcMsw.message.searchMessages.query(() => {
        searchMessages();
        return { count: newCount, data: { hasMore: false, items: [] } };
      }),
    );
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
    server.use(
      trpcMsw.message.searchMessages.query(({ input }) => {
        // The wire input types filters as optional because the schema defaults it, but this read always sends it
        assert.exists(input.filters);
        searchMessages(input.filters);
        return { count: newCount, data: { hasMore: false, items: [] } };
      }),
    );
    await mountRead();
    selectedFilters.value = [pendingFilter, filter];
    searchQuery.value = query;
    await readSearchedMessages();

    expect(searchMessages).toHaveBeenCalledExactlyOnceWith([filter]);
    expect(createSearchHistory).toHaveBeenCalledExactlyOnceWith({ filters: [filter], query, roomId });
  });
});
