import type { ClientMessage } from "@/models/message/ClientMessage";

import { useRoomStore } from "@/store/message/room";

export const useForwardStore = defineStore("message/input/forward", () => {
  const roomStore = useRoomStore();
  const { data: forwardMessageId } = useDataMap<0 | ClientMessage["id"]>(() => roomStore.currentRoomId, 0);
  const { data: roomIds } = useDataMap<string[]>(() => roomStore.currentRoomId, []);
  const { data: messageInput } = useDataMap(() => roomStore.currentRoomId, "");
  const resetForward = () => {
    messageInput.value = "";
    roomIds.value = [];
    forwardMessageId.value = 0;
  };
  return { forwardMessageId, messageInput, resetForward, roomIds };
});
