import type { ClientMessage } from "#src/models/message/ClientMessage";

import { useRoomStore } from "#src/store/message/room/index";

export const useForwardStore = defineStore("message/input/forward", () => {
  const roomStore = useRoomStore();
  const { data: forwardMessageId, getDataRef: getForwardMessageIdRef } = useDataMap<0 | ClientMessage["id"]>(
    () => roomStore.currentRoomId,
    0,
  );
  const { data: roomIds, getDataRef: getRoomIdsRef } = useDataMap<string[]>(() => roomStore.currentRoomId, []);
  const { data: messageInput, getDataRef: getMessageInputRef } = useDataMap(() => roomStore.currentRoomId, "");
  // Empties the panel of the room the forward was composed in, once the server has answered the send. The room is named by
  // The caller, since the route may have moved on by the time the answer lands
  const clearForward = (roomId: string) => {
    getForwardMessageIdRef(roomId).value = 0;
    getMessageInputRef(roomId).value = "";
    getRoomIdsRef(roomId).value = [];
  };
  return { clearForward, forwardMessageId, messageInput, roomIds };
});
