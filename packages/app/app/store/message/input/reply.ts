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

  const dataStore = useDataStore();
  // These are all the messages that have been replied to
  const { data: replyMap } = useDataMap(() => roomStore.currentRoomId, new Map<string, MessageEntity>());
  MessageHookMap[Operation.Create].register(({ replyRowKey }) => {
    if (!replyRowKey) return;
    const reply = dataStore.items.find(({ rowKey: itemRowKey }) => itemRowKey === replyRowKey);
    if (!reply) return;
    replyMap.value.set(replyRowKey, reply);
  });
  MessageHookMap[Operation.Delete].register(({ rowKey: deletedRowKey }) => {
    replyMap.value.delete(deletedRowKey);
  });

  const isIndicatorActive = ref(false);

  return {
    isIndicatorActive,
    replyMap,
    rowKey,
  };
});
