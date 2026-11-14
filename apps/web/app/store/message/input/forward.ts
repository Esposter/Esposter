import { useRoomStore } from "@/store/message/room";

export const useForwardStore = defineStore("message/input/forward", () => {
  const roomStore = useRoomStore();
  const { data: forwardMessageId } = useDataMap(() => roomStore.currentRoomId, "");
  const { data: roomIds } = useDataMap<string[]>(() => roomStore.currentRoomId, []);
  const { data: messageInput } = useDataMap(() => roomStore.currentRoomId, "");
  const resetForward = () => {
    messageInput.value = "";
    roomIds.value = [];
    forwardMessageId.value = "";
  };
  return { forwardMessageId, messageInput, resetForward, roomIds };
});
