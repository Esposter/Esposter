import type { ClientMessage } from "@/models/message/ClientMessage";
import type { MessageInMessage } from "@esposter/db-schema";

import { MessageHook } from "@/models/message/MessageHook";
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { Operation } from "@esposter/shared";

export const useReplyStore = defineStore("message/input/reply", () => {
  const roomStore = useRoomStore();
  const { data: replyToId, setData: setReplyToId } = useDataMap<"" | MessageInMessage["id"]>(
    () => roomStore.currentRoomId,
    "",
  );
  // Keyed by the room the send was for: the reset runs behind the optimistic bubble, so writing through
  // `replyToId.value` would clear the reply target of whichever room the user switched to mid-send instead.
  // Only the room's own composer has one to clear — a thread reply's target is the thread root, which the pane
  // Holds for as long as it is open rather than picking per message
  MessageHookMap[MessageHook.ResetSend].register(({ roomId, threadRootId }) => {
    if (threadRootId) return;

    setReplyToId(roomId, "");
  });

  const dataStore = useDataStore();
  // These are all the messages that have been replied to. Every read and write names the room the message is in —
  // A hook or a read response can land after a switch, and the thread pane renders a room beside the one on screen
  const { getDataRef: getReplyMapRef } = useDataMap(() => roomStore.currentRoomId, new Map<string, ClientMessage>());
  MessageHookMap[Operation.Create].register(({ replyToId: repliedMessageId, roomId }) => {
    if (!repliedMessageId) return;
    const reply = dataStore.getSlice(roomId).items.value.find(({ id }) => id === repliedMessageId);
    if (!reply) return;
    getReplyMapRef(roomId).value.set(repliedMessageId, reply);
  });
  MessageHookMap[Operation.Delete].register(({ id: messageId, roomId }) => {
    getReplyMapRef(roomId).value.delete(messageId);
  });

  const isIndicatorActive = ref(false);

  return { getReplyMapRef, isIndicatorActive, replyToId };
});
