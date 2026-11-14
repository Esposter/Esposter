import type { ClientMessage } from "@/models/message/ClientMessage";

import { RightDrawer } from "@/models/message/RightDrawer";
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { useLayoutStore } from "@/store/layout";
import { useThreadFollowStore } from "@/store/message/threadFollow";
import { useMessageLayoutStore } from "@/store/message/ui/layout";
import { Operation } from "@esposter/shared";

export const useThreadStore = defineStore("message/thread", () => {
  // The drawer shows one thread at a time, so every open supersedes the one before it and a slower earlier
  // Response can never land on the thread the user asked for next
  const readThreadKey = Symbol("readThread");
  const { executeQuery, isPending: isReadThreadPending } = useMutation();
  const activeThreadRootId = ref<"" | ClientMessage["id"]>("");
  const activeRoomId = ref<ClientMessage["roomId"]>("");
  const threadMessages = ref<ClientMessage[]>([]);
  const layoutStore = useLayoutStore();
  const messageLayoutStore = useMessageLayoutStore();
  const threadFollowStore = useThreadFollowStore();
  const { readFollowedThreads } = threadFollowStore;
  // The read is handed in rather than written here, as a room's page read is handed to its data store: what a reply
  // Renders besides itself is read through the file store, which reads this one back
  const openThread = async (
    roomId: string,
    threadRootId: ClientMessage["id"],
    readThreadMessages: () => Promise<ClientMessage[]>,
  ) => {
    activeRoomId.value = roomId;
    activeThreadRootId.value = threadRootId;
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
      executeQuery(readThreadMessages, {
        key: readThreadKey,
        onSuccess: (messages) => {
          // The read spans the whole open, so the user can close the drawer while it is still in flight — a
          // Response applied afterwards reopens a thread they just dismissed
          if (!activeThreadRootId.value) return;
          // A reply can land while the read is in flight, and the create hook has already pushed it here. The
          // Response is a snapshot from before it, so assigning it wholesale drops the reply until a reopen
          const readMessageIds = new Set(messages.map(({ id }) => id));
          threadMessages.value = [...messages, ...threadMessages.value.filter(({ id }) => !readMessageIds.has(id))];
        },
      }),
      // The pane's menu offers the reply notification toggle, so the follow state it reads loads with the
      // Thread rather than on the menu's first open — cached per room, so this is free after the first thread
      readFollowedThreads(roomId),
    ]);
  };
  const closeThread = () => {
    activeThreadRootId.value = "";
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
  // Message the room list holds, so the server's fields reach the pane through the object it already pushed
  const checkIsActiveThreadMessage = ({ id: messageId, roomId }: Pick<ClientMessage, "id" | "roomId">) =>
    roomId === activeRoomId.value && threadMessages.value.some((message) => message.id === messageId);
  MessageHookMap[Operation.Create].register((message) => {
    if (message.roomId !== activeRoomId.value || message.replyToId !== activeThreadRootId.value) return;
    // A message the pane already holds is the room list echoing back a reply it optimistically pushed here
    if (threadMessages.value.some(({ id }) => id === message.id)) return;

    threadMessages.value.push(message);
  });
  MessageHookMap[Operation.Update].register((input) => {
    if (!checkIsActiveThreadMessage(input)) return;

    const message = threadMessages.value.find(({ id }) => id === input.id);
    if (message) Object.assign(message, input);
  });
  MessageHookMap[Operation.Delete].register(({ id: messageId, roomId }) => {
    if (roomId !== activeRoomId.value) return;
    // The thread is named by its root, so a deleted root leaves nothing for the pane to be about
    else if (messageId === activeThreadRootId.value) {
      closeThread();
      return;
    }

    threadMessages.value = threadMessages.value.filter((message) => message.id !== messageId);
  });
  return { activeRoomId, activeThreadRootId, closeThread, isReadThreadPending, openThread, threadMessages };
});
