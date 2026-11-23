import type { ClientMessage } from "#src/models/message/ClientMessage";
import type { ClientThread } from "#src/models/message/ClientThread";

import { RightDrawer } from "#src/models/message/RightDrawer";
import { MutationStatus } from "#src/models/shared/MutationStatus";
import { createInFlightChanges } from "#src/services/message/createInFlightChanges";
import { messageHolderRegistry } from "#src/services/message/messageHolderRegistry";
import { MessageHookMap } from "#src/services/message/MessageHookMap";
import { updateMessageCopy } from "#src/services/message/updateMessageCopy";
import { useLayoutStore } from "#src/store/layout";
import { useThreadFollowStore } from "#src/store/message/threadFollow";
import { useMessageLayoutStore } from "#src/store/message/ui/layout";
import { Operation } from "@esposter/shared";

export const useThreadStore = defineStore("message/thread", () => {
  // The drawer shows one thread at a time, so each open is a run of this scope: a newer open aborts the read the one
  // Before it still waits on, and only the newest read's messages land, so a slower earlier response never lands on
  // The thread the user asked for next
  const readThreadScope = useRunScope();
  const { executeQuery } = useMutation();
  // One key for the drawer, which reads one thread at a time, so a newer open's topic watch replaces the one before it
  const readThreadKey = Symbol("readThread");
  const isReadThreadPending = ref(false);
  // A failed read is held as its message and drawn by the pane in place of its empty state, so no failure reads as a
  // Thread with no replies
  const threadReadError = ref("");
  const activeThreadRootId = ref<0 | ClientMessage["id"]>(0);
  // The open thread's read takes the room's deletes and edits made while it is in flight into its answer as it lands
  const inFlightChanges = createInFlightChanges();
  const activeRoomId = ref<ClientMessage["roomId"]>("");
  const threadMessages = ref<ClientMessage[]>([]);
  // The open thread as a list of threads shows it, once its root has read: what following it lists at once
  const activeThread = computed<ClientThread | undefined>(() => {
    const root = threadMessages.value.find(({ id }) => id === activeThreadRootId.value);
    if (!root) return undefined;

    const replies = threadMessages.value.filter(({ id }) => id !== root.id);
    if (replies.length === 0) return { ...root, replyCount: 0 };
    return {
      ...root,
      lastReplyAt: new Date(Math.max(...replies.map(({ createdAt }) => createdAt.getTime()))),
      replyCount: replies.length,
    };
  });
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
    // The flag belongs to the newest read: a read a newer open superseded settles dropped, and that newer read clears
    // It
    isReadThreadPending.value = true;
    threadReadError.value = "";
    const readThread = async () => {
      const { status } = await executeQuery(
        () => inFlightChanges.read(roomId, readThreadMessages, (answer) => answer),
        {
          key: readThreadKey,
          onError: (error) => {
            threadReadError.value = error.message;
          },
          onSuccess: ({ messages }) => {
            // The read spans the whole open, so the user can close the drawer while it is still in flight — a
            // Response applied afterwards reopens a thread they just dismissed
            if (!activeThreadRootId.value) return;
            // A reply can land while the read is in flight, and the create hook has already pushed it here. The
            // Response is a snapshot from before it, so assigning it wholesale drops the reply until a reopen
            const readMessageIds = new Set(messages.map(({ id }) => id));
            threadMessages.value = [...messages, ...threadMessages.value.filter(({ id }) => !readMessageIds.has(id))];
          },
          runScope: readThreadScope,
        },
      );
      if (status !== MutationStatus.Dropped) isReadThreadPending.value = false;
    };
    await Promise.all([
      readThread(),
      // The pane's header shows the follow toggle, so the follow state it reads loads with the thread — cached per
      // Room, so this is free after the first thread
      readFollowedThreads(roomId),
    ]);
  };
  const closeThread = () => {
    activeThreadRootId.value = 0;
    activeRoomId.value = "";
    threadMessages.value = [];
    // A split exists to hold the thread beside another pane, so it goes with the thread — and the drawer keeps
    // Showing the pane the split was pinning rather than an empty thread
    if (messageLayoutStore.splitRightDrawer) {
      messageLayoutStore.rightDrawer = messageLayoutStore.splitRightDrawer;
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
    inFlightChanges.recordUpdate(input);
    if (!checkIsActiveThreadMessage(input)) return;

    updateMessageCopy(
      threadMessages.value.find(({ id }) => id === input.id),
      input,
    );
  });
  MessageHookMap[Operation.Delete].register(({ id: messageId, roomId }) => {
    inFlightChanges.recordDelete({ id: messageId, roomId });
    if (roomId !== activeRoomId.value) return;
    // The thread is named by its root, so a deleted root leaves nothing for the pane to be about
    if (messageId === activeThreadRootId.value) {
      closeThread();
      return;
    }

    threadMessages.value = threadMessages.value.filter((message) => message.id !== messageId);
  });
  // The replies are rows the room's window does not hold, so the reconnect refresh reads them back through the funnel
  messageHolderRegistry.register((roomId, hold) => {
    if (roomId === activeRoomId.value) hold(threadMessages.value);
  });
  return {
    activeRoomId,
    activeThread,
    activeThreadRootId,
    closeThread,
    isReadThreadPending,
    openThread,
    threadMessages,
    threadReadError,
  };
});
