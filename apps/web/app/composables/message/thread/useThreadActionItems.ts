import type { Item } from "@/models/shared/Item";

import { useCallStore } from "@/store/message/room/call";
import { useThreadStore } from "@/store/message/thread";
import { useThreadFollowStore } from "@/store/message/threadFollow";
import { useMessageLayoutStore } from "@/store/message/ui/layout";
import { ID_SEPARATOR, RoutePath } from "@esposter/shared";

// The thread pane's overflow menu. Everything here acts on the thread the pane is showing, so nothing is
// Passed in — the store already names it, and a prop would only be a second copy that can disagree
export const useThreadActionItems = () => {
  const { executeMutation } = useMutation();
  const copyMessageLink = useCopyMessageLink();
  const threadStore = useThreadStore();
  const { activeRoomId, activeRootRowKey } = storeToRefs(threadStore);
  const threadFollowStore = useThreadFollowStore();
  const { checkIsFollowing, followThread, unfollowThread } = threadFollowStore;
  const callStore = useCallStore();
  const { joinCallByRoomId, leaveCall } = callStore;
  const { callThreadRootRowKey, isConnecting, isInCall } = storeToRefs(callStore);
  const messageLayoutStore = useMessageLayoutStore();
  const { previousRightDrawer, splitRightDrawer } = storeToRefs(messageLayoutStore);
  const isFollowing = computed(() => checkIsFollowing(activeRoomId.value, activeRootRowKey.value));
  // The call this thread can start is the one the user is already in only when it is this thread's — being in
  // The room's call, or another thread's, still leaves this one to start
  const isInThreadCall = computed(() => isInCall.value && callThreadRootRowKey.value === activeRootRowKey.value);
  return computed<Item[]>(() => [
    {
      icon: isFollowing.value ? "mdi-bell-off" : "mdi-bell",
      onClick: async () => {
        const roomId = activeRoomId.value;
        const threadRootRowKey = activeRootRowKey.value;
        await executeMutation(
          () => (isFollowing.value ? unfollowThread(roomId, threadRootRowKey) : followThread(roomId, threadRootRowKey)),
          // Single-flight per thread: the menu closes on click, so a second toggle is a double-fire rather
          // Than an intent to flip back
          { isExclusive: true, key: `${roomId}${ID_SEPARATOR}${threadRootRowKey}` },
        );
      },
      title: isFollowing.value ? "Turn off notifications for replies" : "Turn on notifications for replies",
    },
    {
      icon: "mdi-link-variant",
      onClick: async () => {
        // A thread is named by its root message, so its link is that message's link
        await copyMessageLink(activeRoomId.value, activeRootRowKey.value);
      },
      title: "Copy link",
    },
    {
      // A call in a thread is the room's call addressed by the thread, so it announces itself in the thread and
      // Is joined from here — the room's own call stays where it was, and both can run at once
      disabled: isConnecting.value || (isInCall.value && !isInThreadCall.value),
      icon: isInThreadCall.value ? "mdi-phone-hangup" : "mdi-phone",
      isGroupStart: true,
      onClick: async () => {
        if (isInThreadCall.value) await leaveCall();
        else await joinCallByRoomId(activeRoomId.value, activeRootRowKey.value);
      },
      title: isInThreadCall.value ? "Leave call in thread" : "Start call in thread",
    },
    {
      // Splitting keeps the pane the thread took over — the member list, a search's results — open beside it,
      // Which is the only way to read both at once
      icon: "mdi-view-split-vertical",
      isGroupStart: true,
      onClick: () => {
        splitRightDrawer.value = splitRightDrawer.value ? undefined : previousRightDrawer.value;
      },
      title: splitRightDrawer.value ? "Close split view" : "Open in split view",
    },
    {
      icon: "mdi-open-in-new",
      onClick: () => {
        // The thread's own route, so the window it opens is a full app on that thread rather than a copy of
        // The pane that would have to re-derive every store it reads
        window.open(RoutePath.MessagesThread(activeRoomId.value, activeRootRowKey.value), "_blank");
      },
      title: "Open in new window",
    },
  ]);
};
