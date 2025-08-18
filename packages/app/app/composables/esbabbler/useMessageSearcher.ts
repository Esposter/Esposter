import type { ToData } from "#shared/models/entity/ToData";

import { AzureEntityType } from "#shared/models/azure/AzureEntityType";
import { MessageEntity } from "#shared/models/db/message/MessageEntity";
import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import { useRoomStore } from "@/store/esbabbler/room";

export const useMessageSearcher = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  return useOffsetSearcher<ToData<MessageEntity>, AzureEntityType.Message>(
    async (query, offset) =>
      currentRoomId.value
        ? $trpc.message.searchMessages.query({ limit: 15, offset, query, roomId: currentRoomId.value })
        : new OffsetPaginationData(),
    AzureEntityType.Message,
  );
};
