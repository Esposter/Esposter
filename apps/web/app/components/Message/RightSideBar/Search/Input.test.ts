// @vitest-environment nuxt
import type { searchMessagesInputSchema } from "#shared/models/db/message/SearchMessagesInput";
import type { z } from "zod";

import MessageRightSideBarSearchInput from "@/components/Message/RightSideBar/Search/Input.vue";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useSearchMessageStore } from "@/store/message/search";
import { useSearchHistoryStore } from "@/store/message/search/history";
import { FilterType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

describe("messageRightSideBarSearchInput", () => {
  const server = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const query = "a";
  let searchMessages: ReturnType<typeof vi.fn<(input: z.input<typeof searchMessagesInputSchema>) => void>>;

  // The field as the user drives it: the mount first, because it resets the route and the store keys every field by the
  // Room in it, then the text typed into it
  const type = async (text: string) => {
    searchMessages = vi.fn<(input: z.input<typeof searchMessagesInputSchema>) => void>();
    server.use(
      trpcMsw.message.searchMessages.query(({ input }) => {
        searchMessages(input);
        return { count: 0, data: { hasMore: false, items: [] } };
      }),
    );
    const component = await mountSuspended(MessageRightSideBarSearchInput);
    setCurrentRoomId(roomId);
    const searchMessageStore = useSearchMessageStore();
    const { searchQuery, selectedFilters } = storeToRefs(searchMessageStore);
    searchQuery.value = "";
    selectedFilters.value = [];
    const searchHistoryStore = useSearchHistoryStore();
    vi.spyOn(searchHistoryStore, "createSearchHistory").mockResolvedValue();
    const input = component.get('input[aria-label="Search"]');
    await input.setValue(text);
    await flushPromises();
    return { input, searchMessageStore };
  };

  const search = async (text: string) => {
    const { input, searchMessageStore } = await type(text);
    await input.trigger("keydown", { key: "Enter" });
    await flushPromises();
    return searchMessageStore;
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("sends the typed text as the query", async () => {
    expect.hasAssertions();

    await search(query);

    expect(searchMessages).toHaveBeenCalledExactlyOnceWith({ filters: [], offset: undefined, query, roomId });
  });

  // The colon is what converts, so the chip is added mid-typing and Enter has nothing left to search on
  test(`${FilterType.From}: the keyword and its colon become a chip instead of a search`, async () => {
    expect.hasAssertions();

    const { searchQuery, selectedFilters } = storeToRefs(await search(`${FilterType.From.toLowerCase()}:`));

    expect(selectedFilters.value).toStrictEqual([{ type: FilterType.From, value: "" }]);
    expect(searchQuery.value).toBe("");
    expect(searchMessages).not.toHaveBeenCalled();
  });

  // A word that ends in a colon but names no filter type is search text, colon and all
  test("a word that is not a keyword is searched for verbatim", async () => {
    expect.hasAssertions();

    const colonQuery = `${query}:`;
    const { selectedFilters } = storeToRefs(await search(colonQuery));

    expect(selectedFilters.value).toStrictEqual([]);
    expect(searchMessages).toHaveBeenCalledExactlyOnceWith({
      filters: [],
      offset: undefined,
      query: colonQuery,
      roomId,
    });
  });
});
