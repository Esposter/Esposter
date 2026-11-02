import type { OnlineSubscribableContext } from "@/models/shared/OnlineSubscribableContext";

import { getUnsubscribe } from "@/services/shared/getUnsubscribe";
import { useCallStore } from "@/store/message/room/call";
import { useKnockerStore } from "@/store/message/room/call/knocker";

// The standalone call page's share of the joined call: its participants, and the knock stream of its doorkeeper
export const useCallJoinedSubscribables = (onlineSubscribableContext: OnlineSubscribableContext) => {
  const { $trpc } = useNuxtApp();
  const callStore = useCallStore();
  const { activeCallSessionId, isDoorkeeper } = storeToRefs(callStore);
  const knockerStore = useKnockerStore();
  const { createKnocker } = knockerStore;

  useCallParticipantSubscribables(onlineSubscribableContext);
  useOnlineSubscribable(
    activeCallSessionId,
    (callSessionId) => {
      // Only the doorkeeper is let into the knock stream, so nobody else opens one
      if (!callSessionId || !isDoorkeeper.value) return undefined;

      return getUnsubscribe(
        $trpc.callSession.knocker.onKnockCall.subscribe(callSessionId, {
          onData: (knocker) => {
            createKnocker(knocker);
          },
        }),
      );
    },
    onlineSubscribableContext,
  );
};
