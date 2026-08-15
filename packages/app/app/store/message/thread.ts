import type { MessageEntity } from "@esposter/db-schema";

import { RightDrawer } from "@/models/message/RightDrawer";
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { useLayoutStore } from "@/store/layout";
import { useThreadFollowStore } from "@/store/message/threadFollow";
import { useMessageLayoutStore } from "@/store/message/ui/layout";
import { Operation } from "@esposter/shared";

export const useThreadStore = defineStore("message/thread", () => {
  const { $trpc } = useNuxtApp();
  // The drawer shows one thread at a time, so every open supersedes the one before it and a slower earlier
  // Response can never land on the thread the user asked for next
  const readThreadKey = Symbol("readThread");
  const { executeQuery, isPending: isReadingThread } = useMutation();
  const activeRootRowKey = ref<MessageEntity["rowKey"]>("");
  const activeRoomId = ref<MessageEntity["partitionKey"]>("");
  const threadMessages = ref<MessageEntity[]>([]);
  const layoutStore = useLayoutStore();
  const messageLayoutStore = useMessageLayoutStore();
  const threadFollowStore = useThreadFollowStore();
  const { ensureFollowedThreadsLoaded } = threadFollowStore;

  const openThread = async (roomId: string, rootRowKey: string) => {
    activeRoomId.value = roomId;
    activeRootRowKey.value = rootRowKey;
    // Cleared with the drawer rather than when the replies land, so the pane never shows the previous thread's
    // Replies under the new thread's header while the read is in flight
    threadMessages.value = [];
    // The drawer opens on the click rather than on the response: a read spanning a slow round trip — or failing
    // Outright — otherwise leaves the click with no visible effect at all
    if (messageLayoutStore.rightDrawer !== RightDrawer.Thread)
      messageLayoutStore.previousRightDrawer = messageLayoutStore.rightDrawer;
    messageLayoutStore.rightDrawer = RightDrawer.Thread;
    layoutStore.isRightDrawerOpen = true;
    await Promise.all([
      executeQuery(() => $trpc.message.readThread.query({ roomId, rootRowKey }), {
        key: readThreadKey,
        onSuccess: (messages) => {
          // The read spans the whole open, so the user can close the drawer while it is still in flight — a
          // Response applied afterwards reopens a thread they just dismissed
          if (!activeRootRowKey.value) return;
          // A reply can land while the read is in flight, and the create hook has already pushed it here. The
          // Response is a snapshot from before it, so assigning it wholesale drops the reply until a reopen
          const readRowKeys = new Set(messages.map(({ rowKey }) => rowKey));
          threadMessages.value = [
            ...messages,
            ...threadMessages.value.filter(({ rowKey }) => !readRowKeys.has(rowKey)),
          ];
        },
      }),
      // The pane's menu offers the reply notification toggle, so the follow state it reads loads with the
      // Thread rather than on the menu's first open — cached per room, so this is free after the first thread
      ensureFollowedThreadsLoaded(roomId),
    ]);
  };
  const closeThread = () => {
    activeRootRowKey.value = "";
    activeRoomId.value = "";
    threadMessages.value = [];
    // A split exists to hold the thread beside another pane, so it goes with the thread — and the drawer keeps
    // Showing the pane the split was pinning rather than an empty thread
    const { splitRightDrawer } = messageLayoutStore;
    if (splitRightDrawer) {
      messageLayoutStore.rightDrawer = splitRightDrawer;
      messageLayoutStore.splitRightDrawer = undefined;
      return;
    }

    layoutStore.isRightDrawerOpen = false;
  };
  // The open pane is a live view of the thread, not the snapshot `readThread` returned: without these a reply
  // Lands in the room list and the thread it belongs to shows nothing until it is reopened — including the
  // Sender's own reply, which is the composer's entire feedback. The optimistic bubble is the same reactive
  // Entity the room list holds, so the server's fields reach the pane through the object it already pushed
  const getIsActiveThreadMessage = ({ partitionKey, rowKey }: Pick<MessageEntity, "partitionKey" | "rowKey">) =>
    partitionKey === activeRoomId.value && threadMessages.value.some((message) => message.rowKey === rowKey);
  MessageHookMap[Operation.Create].register((message) => {
    if (message.partitionKey !== activeRoomId.value || message.replyRowKey !== activeRootRowKey.value) return;
    // A message the pane already holds is the room list echoing back a reply it optimistically pushed here
    if (threadMessages.value.some(({ rowKey }) => rowKey === message.rowKey)) return;

    threadMessages.value.push(message);
  });
  MessageHookMap[Operation.Update].register((input) => {
    if (!getIsActiveThreadMessage(input)) return;

    const message = threadMessages.value.find(({ rowKey }) => rowKey === input.rowKey);
    if (message) Object.assign(message, input);
  });
  MessageHookMap[Operation.Delete].register(({ partitionKey, rowKey }) => {
    if (partitionKey !== activeRoomId.value) return;
    // The thread is named by its root, so a deleted root leaves nothing for the pane to be about
    else if (rowKey === activeRootRowKey.value) {
      closeThread();
      return;
    }

    threadMessages.value = threadMessages.value.filter((message) => message.rowKey !== rowKey);
  });
  return {
    activeRoomId,
    activeRootRowKey,
    closeThread,
    isReadingThread,
    openThread,
    threadMessages,
  };
});
