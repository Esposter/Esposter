import type { OnlineSubscribableContext } from "@/models/shared/OnlineSubscribableContext";

import { getUnsubscribe } from "@/services/shared/getUnsubscribe";
import { useCallStore } from "@/store/message/room/call";
import { useKnockerStore } from "@/store/message/room/call/knocker";

export const useCallJoinedSubscribables = (onlineSubscribableContext: OnlineSubscribableContext) => {
  const { $trpc } = useNuxtApp();
  const callStore = useCallStore();
  const { activeCallSessionId } = storeToRefs(callStore);
  const knockerStore = useKnockerStore();
  const { createKnocker } = knockerStore;
  const subscribeCallParticipants = useSubscribeCallParticipants();

  useOnlineSubscribable(
    activeCallSessionId,
    (callSessionId) => {
      if (!callSessionId) return undefined;

      return getUnsubscribe(
        subscribeCallParticipants(callSessionId),
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
