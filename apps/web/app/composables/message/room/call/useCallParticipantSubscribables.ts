import type { OnlineSubscribableContext } from "#src/models/shared/OnlineSubscribableContext";

import { useCallStore } from "#src/store/message/room/call/index";

// The joined call's participant frames, registered while the call is joined by whichever surface shows it: the messages
// Layout for a room's call, the call page for a standalone one
export const useCallParticipantSubscribables = (onlineSubscribableContext: OnlineSubscribableContext) => {
  const callStore = useCallStore();
  const { activeCallSessionId } = storeToRefs(callStore);
  const subscribeCallParticipants = useSubscribeCallParticipants();

  useOnlineSubscribable(
    activeCallSessionId,
    async (callSessionId) => {
      if (!callSessionId) return undefined;

      return subscribeCallParticipants(callSessionId);
    },
    onlineSubscribableContext,
  );
};
