// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";
import type { MockInstance } from "vitest";

import type { Filter } from "@esposter/db-schema";

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
  let hasFiles: Ref<boolean>;
  let page: Ref<number>;
  let searchQuery: Ref<string>;
  let selectedFilters: Ref<Filter[]>;
  let createSearchHistory: MockInstance<ReturnType<typeof useSearchHistoryStore>["createSearchHistory"]>;
  let readSearchedMessages: ReturnType<typeof useReadSearchedMessages>;
  const roomId = crypto.randomUUID();
  const newCount = 3;
  const filesPage = 5;
  const searchPage = 2;
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
          ({ count, hasFiles, page, searchQuery, selectedFilters } = storeToRefs(searchMessageStore));
          // Each tab's page starts at its own value, so a page written into the wrong slice is visible
          hasFiles.value = true;
          page.value = filesPage;
          hasFiles.value = false;
          page.value = searchPage;
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

  // Each tab owns its own result slice, and the totals, the page and the history entry a search writes back are
  // As much a part of that slice as the rows — flipping to Files mid-flight must not hand the attachment browse
  // The text search's total, nor drop the history entry the text search earned
  test("files a search's totals, page and history under the tab it was issued for", async () => {
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
    const pendingSearch = readSearchedMessages();
    // The search is issued a microtask after the call, so let it go out before the tab moves
    await flushPromises();
    // The user opens "Files in this room" before the text search comes back
    hasFiles.value = true;
    releaseSearch();
    await pendingSearch;

    expect(count.value).toBe(0);
    expect(page.value).toBe(filesPage);

    hasFiles.value = false;

    expect(count.value).toBe(newCount);
    expect(page.value).toBe(1);
    expect(createSearchHistory).toHaveBeenCalledTimes(1);
  });

  // A chip the user added by typing its keyword has no value until a picker gives it one, and the search input
  // Schema rejects that "" — so the read that used to send it failed outright rather than searching on the text
  // The user had typed. Neither the search nor the history entry it earns carries one
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
