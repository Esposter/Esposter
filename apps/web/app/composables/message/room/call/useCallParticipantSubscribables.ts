import type { OnlineSubscribableContext } from "@/models/shared/OnlineSubscribableContext";

import { useCallStore } from "@/store/message/room/call";

// The joined call's five participant events, subscribed by whichever surface the call is shown on: the messages layout
// For a room's call, the call page for a standalone one. The viewed room yields to it while both are the same session,
// So a session is subscribed by exactly one of them
export const useCallParticipantSubscribables = (onlineSubscribableContext: OnlineSubscribableContext) => {
  const callStore = useCallStore();
  const { activeCallSessionId } = storeToRefs(callStore);
  const subscribeCallParticipants = useSubscribeCallParticipants();

  useOnlineSubscribable(
    activeCallSessionId,
    async (callSessionId) => {
      if (!callSessionId) return undefined;

      const { unsubscribe } = await subscribeCallParticipants(callSessionId);
      return unsubscribe;
    },
    onlineSubscribableContext,
  );
};
