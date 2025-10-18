import { useRoomStore } from "@/store/message/room";

export const useForwardStore = defineStore("message/forward", () => {
  const roomStore = useRoomStore();
  const { data: rowKey } = useDataMap(() => roomStore.currentRoomId, "");
  const { data: roomIds } = useDataMap<string[]>(() => roomStore.currentRoomId, []);
  const { data: messageInput } = useDataMap(() => roomStore.currentRoomId, "");
  return {
    messageInput,
    roomIds,
    rowKey,
  };
});
