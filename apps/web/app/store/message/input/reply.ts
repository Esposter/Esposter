import type { MessageEntity } from "@esposter/db-schema";

import { MessageHookMap } from "@/services/message/MessageHookMap";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { Operation } from "@esposter/shared";

export const useReplyStore = defineStore("message/input/reply", () => {
  const roomStore = useRoomStore();
  const { data: rowKey, setData: setRowKey } = useDataMap(() => roomStore.currentRoomId, "");
  // Keyed by the room the send was for: the reset runs behind the optimistic bubble, so writing through
  // `rowKey.value` would clear the reply target of whichever room the user switched to mid-send instead.
  // Only the room's own composer has one to clear — a thread reply's target is the thread root, which the pane
  // Holds for as long as it is open rather than picking per message
  MessageHookMap.ResetSend.register(({ roomId, threadRootRowKey }) => {
    if (threadRootRowKey) return;

    setRowKey(roomId, "");
  });

  // Read through the store rather than destructured: the data store instantiates this one inside its own setup,
  // So at this point it is still the partial store and holds none of its functions yet
  const dataStore = useDataStore();
  // These are all the messages that have been replied to. Every read and write names the room the message is in —
  // A hook or a read response can land after a switch, and the thread pane renders a room beside the one on screen
  const { getDataRef: getReplyMapRef } = useDataMap(() => roomStore.currentRoomId, new Map<string, MessageEntity>());
  MessageHookMap[Operation.Create].register(({ partitionKey, replyRowKey }) => {
    if (!replyRowKey) return;
    const reply = dataStore
      .getSlice(partitionKey)
      .items.value.find(({ rowKey: itemRowKey }) => itemRowKey === replyRowKey);
    if (!reply) return;
    getReplyMapRef(partitionKey).value.set(replyRowKey, reply);
  });
  MessageHookMap[Operation.Delete].register(({ partitionKey, rowKey: deletedRowKey }) => {
    getReplyMapRef(partitionKey).value.delete(deletedRowKey);
  });

  const isIndicatorActive = ref(false);

  return {
    getReplyMapRef,
    isIndicatorActive,
    rowKey,
  };
});
