import type { ClientMessage } from "#src/models/message/ClientMessage";

import { useRoomStore } from "#src/store/message/room/index";

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
