import { AzureEntityType } from "#shared/models/azure/AzureEntityType";
import { MessageEntity } from "#shared/models/db/message/MessageEntity";
import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import { useRoomStore } from "@/store/message/room";

export const useMessageSearcher = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  return useOffsetSearcher(
    async (query, offset) =>
      currentRoomId.value
        ? await $trpc.message.searchMessages.query({ offset, query, roomId: currentRoomId.value })
        : new OffsetPaginationData<MessageEntity>(),
    AzureEntityType.Message,
  );
};
