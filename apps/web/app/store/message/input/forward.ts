import type { ClientMessage } from "#src/models/message/ClientMessage";
import type { ForwardDraft } from "#src/models/message/ForwardDraft";

import { applyIfUnchanged } from "#src/services/shared/applyIfUnchanged";
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
  // The caller, since the route may have moved on by the time the answer lands. Each field empties only while it still
  // Holds what the forward sent, so a text or room pick the reader changed while the server had it stays in the panel
  const clearForward = (roomId: string, sent: ForwardDraft) => {
    getForwardMessageIdRef(roomId).value = 0;
    applyIfUnchanged(getMessageInputRef(roomId), sent.message, "");
    applyIfUnchanged(getRoomIdsRef(roomId), sent.roomIds, []);
  };
  return { clearForward, forwardMessageId, messageInput, roomIds };
});
