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
  // Empties the panel of the current room and returns the rollback that puts what it held back into that room. The room is
  // Pinned here because the route may have moved on by the time a refused forward's answer lands
  const takeForward = () => {
    const roomId = roomStore.currentRoomId;
    const draft = {
      forwardMessageId: forwardMessageId.value,
      messageInput: messageInput.value,
      roomIds: roomIds.value,
    };
    messageInput.value = "";
    roomIds.value = [];
    forwardMessageId.value = 0;
    return () => {
      getForwardMessageIdRef(roomId).value = draft.forwardMessageId;
      getMessageInputRef(roomId).value = draft.messageInput;
      getRoomIdsRef(roomId).value = draft.roomIds;
    };
  };
  return { forwardMessageId, messageInput, roomIds, takeForward };
});
