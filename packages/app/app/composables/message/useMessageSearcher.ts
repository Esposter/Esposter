import { AzureEntityType } from "#shared/models/azure/AzureEntityType";
import { MessageEntity } from "#shared/models/db/message/MessageEntity";
import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import { useRoomStore } from "@/store/message/room";
import { useSearchMessageStore } from "@/store/message/searchMessage";

export const useMessageSearcher = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const searchMessageStore = useSearchMessageStore();
  const { selectedFilters } = storeToRefs(searchMessageStore);
  return useOffsetSearcher(
    async (query, offset) =>
      currentRoomId.value
        ? await $trpc.message.searchMessages.query({
            filters: selectedFilters.value.length > 0 ? selectedFilters.value : undefined,
            offset,
            query,
            roomId: currentRoomId.value,
          })
        : new OffsetPaginationData<MessageEntity>(),
    AzureEntityType.Message,
  );
};
