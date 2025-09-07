import { createDataMap } from "@/services/shared/createDataMap";
import { useRoomStore } from "@/store/message/room";

export const useForwardStore = defineStore("message/forward", () => {
  const roomStore = useRoomStore();
  const { data: rowKey } = createDataMap(() => roomStore.currentRoomId, "");
  const { data: roomIds } = createDataMap<string[]>(() => roomStore.currentRoomId, []);
  const { data: messageInput } = createDataMap(() => roomStore.currentRoomId, "");
  return {
    messageInput,
    roomIds,
    rowKey,
  };
});
