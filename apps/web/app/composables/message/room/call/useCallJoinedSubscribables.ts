import type { OnlineSubscribableContext } from "@/models/shared/OnlineSubscribableContext";

import { getUnsubscribe } from "@/services/shared/getUnsubscribe";
import { useCallStore } from "@/store/message/room/call";
import { useKnockerStore } from "@/store/message/room/call/knocker";

export const useCallJoinedSubscribables = (onlineSubscribableContext: OnlineSubscribableContext) => {
  const { $trpc } = useNuxtApp();
  const callStore = useCallStore();
  const { activeCallSessionId, isDoorkeeper } = storeToRefs(callStore);
  const knockerStore = useKnockerStore();
  const { createKnocker } = knockerStore;
  const subscribeCallParticipants = useSubscribeCallParticipants();

  useOnlineSubscribable(
    activeCallSessionId,
    async (callSessionId) => {
      if (!callSessionId) return undefined;

      // The join's snapshot predates this subscription, so the session is read again once it is open, which replays
      // Whatever the connect delivered in between
      const participantSubscription = await subscribeCallParticipants(callSessionId);
      // Only the doorkeeper is let into the knock stream, so nobody else opens one
      return getUnsubscribe(
        participantSubscription,
        ...(isDoorkeeper.value
          ? [
              $trpc.callSession.knocker.onKnockCall.subscribe(callSessionId, {
                onData: (knocker) => {
                  createKnocker(knocker);
                },
              }),
            ]
          : []),
      );
    },
    onlineSubscribableContext,
  );
};
