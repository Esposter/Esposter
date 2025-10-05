import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { useRoomStore } from "@/store/message/room";

export const usePinStore = defineStore("message/pin", () => {
  const roomStore = useRoomStore();
  return useCursorPaginationDataMap<MessageEntity>(() => roomStore.currentRoomId);
});
