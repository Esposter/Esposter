import { useRoomStore } from "@/store/message/room";

export const useForwardStore = defineStore("message/input/forward", () => {
  const roomStore = useRoomStore();
  const { data: rowKey } = useDataMap(() => roomStore.currentRoomId, "");
  const { data: roomIds } = useDataMap<string[]>(() => roomStore.currentRoomId, []);
  const { data: messageInput } = useDataMap(() => roomStore.currentRoomId, "");
  const resetForward = () => {
    messageInput.value = "";
    roomIds.value = [];
    rowKey.value = "";
  };
  return {
    messageInput,
    resetForward,
    roomIds,
    rowKey,
  };
});
