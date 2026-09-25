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
    (callSessionId) => {
      if (!callSessionId) return undefined;

      // Only the doorkeeper is let into the knock stream, so nobody else opens one
      return getUnsubscribe(
        subscribeCallParticipants(callSessionId),
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
