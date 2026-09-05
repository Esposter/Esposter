// @vitest-environment nuxt
import type { z } from "zod";

import { searchMessagesInputSchema } from "#shared/models/db/message/SearchMessagesInput";
import MessageRightSideBarSearchInput from "@/components/Message/RightSideBar/Search/Input.vue";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useSearchMessageStore } from "@/store/message/search";
import { useSearchHistoryStore } from "@/store/message/search/history";
import { FilterType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";
import { VAutocomplete } from "vuetify/components";

describe("messageRightSideBarSearchInput", () => {
  const server = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const query = "a";
  let searchMessages: ReturnType<typeof vi.fn<(input: z.input<typeof searchMessagesInputSchema>) => void>>;

  // The field as the user drives it, in the order the browser fires it: focus first, then the character. Vuetify
  // Clears its own search text on that focus transition, so a character arriving before the clear is handled is
  // Exactly the case that reaches the server as an empty query. The mount comes first because it resets the
  // Route, and the store keys every field by the room in it
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
    vi.spyOn(useSearchHistoryStore(), "createSearchHistory").mockResolvedValue();
    const autocomplete = component.getComponent(VAutocomplete);
    autocomplete.vm.$emit("update:focused", true);
    autocomplete.vm.$emit("update:search", text);
    await flushPromises();
    return { autocomplete, searchMessageStore };
  };

  const search = async (text: string) => {
    const { autocomplete, searchMessageStore } = await type(text);
    await autocomplete.find("input").trigger("keydown", { key: "Enter" });
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

  // The query outlives focus, the way Discord's does. Vuetify clears its own search text whenever focus changes,
  // So the field would empty itself the moment the user clicked away from a query they had not searched yet — and
  // The clear arrives before any overlay has closed, so nothing but the blur itself can be relied on to swallow it
  test("keeps the typed text after focus is lost", async () => {
    expect.hasAssertions();

    const { autocomplete, searchMessageStore } = await type(query);
    autocomplete.vm.$emit("update:focused", false);
    autocomplete.vm.$emit("update:search", "");
    await flushPromises();

    expect(autocomplete.find("input").element.value).toBe(query);
    expect(searchMessageStore.searchQuery).toBe(query);
  });

  // The focus-gain clear is undone from a snapshot a tick later, and that restore must never win over a character
  // Typed inside the tick — doing so is what sent a one-character search to the server as an empty query
  test("keeps a character typed before the focus restore has run", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(MessageRightSideBarSearchInput);
    setCurrentRoomId(roomId);
    const searchMessageStore = useSearchMessageStore();
    const autocomplete = component.getComponent(VAutocomplete);
    // Focus, then Vuetify's own clear of the field, then the character — all before the restore's tick elapses
    autocomplete.vm.$emit("update:focused", true);
    autocomplete.vm.$emit("update:search", "");
    autocomplete.vm.$emit("update:search", query);
    await flushPromises();

    expect(searchMessageStore.searchQuery).toBe(query);
  });

  // Creating a chip empties the field deliberately, and the focus restore cannot tell that emptiness from
  // Vuetify's own clear — so a snapshot left standing resurrects the text the chip replaced, and the next Enter
  // Searches for it
  test(`${FilterType.From}: the keyword replacing typed text is not resurrected by the focus restore`, async () => {
    expect.hasAssertions();

    const component = await mountSuspended(MessageRightSideBarSearchInput);
    setCurrentRoomId(roomId);
    const searchMessageStore = useSearchMessageStore();
    const { searchQuery, selectedFilters } = storeToRefs(searchMessageStore);
    searchQuery.value = query;
    selectedFilters.value = [];
    const autocomplete = component.getComponent(VAutocomplete);
    // Focus snapshots the typed text, and the keyword arrives before the restore's tick has elapsed
    autocomplete.vm.$emit("update:focused", true);
    autocomplete.vm.$emit("update:search", `${FilterType.From.toLowerCase()}:`);
    await flushPromises();

    expect(selectedFilters.value).toStrictEqual([{ type: FilterType.From, value: "" }]);
    expect(searchQuery.value).toBe("");
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
