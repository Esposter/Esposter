import { createDataMap } from "@/services/shared/createDataMap";
import { useRoomStore } from "@/store/esbabbler/room";

export const useForwardStore = defineStore("esbabbler/forward", () => {
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
