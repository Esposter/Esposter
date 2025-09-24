import { MessageEntityPropertyNames } from "#shared/models/db/message/MessageEntity";
import { RightDrawer } from "@/models/message/RightDrawer";
import { useLayoutStore } from "@/store/layout";
import { useLayoutStore as useMessageLayoutStore } from "@/store/message/layout";
import { useRoomStore } from "@/store/message/room";
import { useSearchHistoryStore } from "@/store/message/searchHistory";
import { useSearchMessageStore } from "@/store/message/searchMessage";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const useReadSearchedMessages = () => {
  const { $trpc } = useNuxtApp();
  const layoutStore = useLayoutStore();
  const { isRightDrawerOpen } = storeToRefs(layoutStore);
  const messageLayoutStore = useMessageLayoutStore();
  const { rightDrawer } = storeToRefs(messageLayoutStore);
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const searchMessageStore = useSearchMessageStore();
  const { getReadMoreItems } = searchMessageStore;
  const { isSearching, menu, page, searchQuery, totalItemsLength } = storeToRefs(searchMessageStore);
  const { selectedFilters } = storeToRefs(searchMessageStore);
  const searchHistoryStore = useSearchHistoryStore();
  const { createSearchHistory } = searchHistoryStore;
  return getReadMoreItems(
    async (offset) => {
      if (!currentRoomId.value)
        throw new InvalidOperationError(
          Operation.Read,
          useReadSearchedMessages.name,
          MessageEntityPropertyNames.partitionKey,
        );

      menu.value = false;
      isSearching.value = true;
      isRightDrawerOpen.value = true;
      rightDrawer.value = RightDrawer.Search;
      const { count, data } = await $trpc.message.searchMessages.query({
        filters: selectedFilters.value,
        offset,
        query: searchQuery.value,
        roomId: currentRoomId.value,
      });
      // No offset means the user has searched the message instead of reading from the offset pagination
      if (!offset) {
        page.value = 1;
        await createSearchHistory({
          filters: selectedFilters.value.length > 0 ? selectedFilters.value : undefined,
          query: searchQuery.value,
          roomId: currentRoomId.value,
        });
      }
      if (count !== undefined) totalItemsLength.value = count;
      return data;
    },
    () => {
      isSearching.value = false;
    },
  );
};
