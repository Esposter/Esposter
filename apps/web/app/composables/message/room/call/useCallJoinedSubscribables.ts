import type { OnlineSubscribableContext } from "#src/models/shared/OnlineSubscribableContext";

import { useCallStore } from "#src/store/message/room/call/index";
import { useKnockerStore } from "#src/store/message/room/call/knocker";
import { useConnectionStore } from "#src/store/realtime/connection";

// The standalone call page's share of the joined call: its participants, and the knock frames of its doorkeeper
export const useCallJoinedSubscribables = (onlineSubscribableContext: OnlineSubscribableContext) => {
  const callStore = useCallStore();
  const { activeCallSessionId, isDoorkeeper } = storeToRefs(callStore);
  const knockerStore = useKnockerStore();
  const { createKnocker } = knockerStore;
  const connectionStore = useConnectionStore();
  const { onCallEvent } = connectionStore;

  useCallParticipantSubscribables(onlineSubscribableContext);
  useOnlineSubscribable(
    activeCallSessionId,
    (callSessionId) => {
      // Only the doorkeeper is sent the knocks, so nobody else registers for them
      if (!callSessionId || !isDoorkeeper.value) return undefined;

      return onCallEvent("knockCall", ({ knocker }) => {
        createKnocker(knocker);
      });
    },
    onlineSubscribableContext,
  );
};
