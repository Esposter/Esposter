// @unocss-include
import type { Item } from "#src/models/shared/Item";

import { useCallStore } from "#src/store/message/room/call/index";
import { useThreadStore } from "#src/store/message/thread";
import { useMessageLayoutStore } from "#src/store/message/ui/layout";
import { RoutePath } from "@esposter/shared";

// The thread pane's overflow menu, beside the follow toggle its header shows. Everything here acts on the thread the
// Pane is showing, so nothing is passed in — the store already names it, and a prop would only be a second copy that
// Can disagree
export const useThreadActionItems = () => {
  const copyMessageLink = useCopyMessageLink();
  const threadStore = useThreadStore();
  const { activeRoomId, activeThreadRootId } = storeToRefs(threadStore);
  const callStore = useCallStore();
  const { joinCallByRoomId, leaveCall } = callStore;
  const { callThreadRootId, isConnecting, isInCall } = storeToRefs(callStore);
  const messageLayoutStore = useMessageLayoutStore();
  const { previousRightDrawer, splitRightDrawer } = storeToRefs(messageLayoutStore);
  // The call this thread can start is the one the user is already in only when it is this thread's — being in
  // The room's call, or another thread's, still leaves this one to start
  const isInThreadCall = computed(() => isInCall.value && callThreadRootId.value === activeThreadRootId.value);
  return computed<Item[]>(() => [
    {
      icon: "i-mdi:link-variant",
      onClick: async () => {
        // A thread is named by its root message, so its link is that message's link
        const threadRootId = activeThreadRootId.value;
        if (threadRootId) await copyMessageLink(activeRoomId.value, threadRootId);
      },
      title: "Copy link",
    },
    {
      // A call in a thread is the room's call addressed by the thread, so it announces itself in the thread and
      // Is joined from here — the room's own call stays where it was, and both can run at once
      disabled: isConnecting.value || (isInCall.value && !isInThreadCall.value),
      icon: isInThreadCall.value ? "i-mdi:phone-hangup" : "i-mdi:phone",
      isGroupStart: true,
      onClick: async () => {
        if (isInThreadCall.value) leaveCall();
        else await joinCallByRoomId(activeRoomId.value, activeThreadRootId.value);
      },
      title: isInThreadCall.value ? "Leave call in thread" : "Start call in thread",
    },
    {
      // Splitting keeps the pane the thread took over — the member list, a search's results — open beside it,
      // Which is the only way to read both at once
      icon: "i-mdi:view-split-vertical",
      isGroupStart: true,
      onClick: () => {
        splitRightDrawer.value = splitRightDrawer.value ? undefined : previousRightDrawer.value;
      },
      title: splitRightDrawer.value ? "Close split view" : "Open in split view",
    },
    {
      icon: "i-mdi:open-in-new",
      onClick: () => {
        // The thread's own route, so the window it opens is a full app on that thread rather than a copy of
        // The pane that would have to re-derive every store it reads
        window.open(RoutePath.MessagesThread(activeRoomId.value, activeThreadRootId.value), "_blank");
      },
      title: "Open in new window",
    },
  ]);
};
