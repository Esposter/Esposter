import type { SearchMessagesInput } from "#shared/models/db/message/SearchMessagesInput";
import type { PartialByKeys } from "unocss";

import { useRoomStore } from "@/store/message/room";
import { useSearchMessageStore } from "@/store/message/searchMessage";

export const useReadSearchedMessages = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const searchMessageStore = useSearchMessageStore();
  const { hasMore, items, offset } = storeToRefs(searchMessageStore);
  const { selectedFilters } = storeToRefs(searchMessageStore);
  return async ({
    offset: inputOffset = 0,
    query,
  }: PartialByKeys<Pick<SearchMessagesInput, "offset" | "query">, "offset">) => {
    if (!currentRoomId.value) return;

    const response = await $trpc.message.searchMessages.query({
      filters: selectedFilters.value.length > 0 ? selectedFilters.value : undefined,
      offset: inputOffset,
      query: query.trim(),
      roomId: currentRoomId.value,
    });

    if (inputOffset === 0) items.value = response.items;
    else items.value.push(...response.items);

    hasMore.value = response.hasMore;
    offset.value = (inputOffset === 0 ? 0 : inputOffset) + response.items.length;
  };
};
