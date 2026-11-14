import type { OnlineSubscribableContext } from "@/models/shared/OnlineSubscribableContext";

import { useCallStore } from "@/store/message/room/call";
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { useConnectionStore } from "@/store/realtime/connection";
import { getResultAsync, getSynchronizedFunction, noop, RoutePath } from "@esposter/shared";

// The knocker's answer frames arrive on the call socket its knock opened, addressed to this knocker alone, so they are
// Acted on as they arrive rather than filtered
export const useCallKnockingSubscribables = (callId: string, onlineSubscribableContext: OnlineSubscribableContext) => {
  const callStore = useCallStore();
  const { joinCall } = callStore;
  const knockerStore = useKnockerStore();
  const { knockingCallSessionId } = storeToRefs(knockerStore);
  const { cancelKnock } = knockerStore;
  const connectionStore = useConnectionStore();
  const { onCallEvent } = connectionStore;

  useOnlineSubscribable(
    knockingCallSessionId,
    (callSessionId) => {
      if (!callSessionId) return undefined;

      // Neither call can reject — `joinCall` unwinds and alerts its own failure — so there is nothing here
      // For a terminator to hold, and a failed admit leaves the user on the pre-join screen they knocked from
      const unregisterAdmitted = onCallEvent(
        "knockerAdmitted",
        getSynchronizedFunction(async () => {
          cancelKnock();
          await joinCall(callId);
        }),
      );
      const unregisterDismissed = onCallEvent(
        "knockerDismissed",
        getSynchronizedFunction(async () => {
          await getResultAsync(async () => {
            cancelKnock();
            await navigateTo(RoutePath.CallsIndex);
          }).match(noop, console.error);
        }),
      );
      return () => {
        unregisterAdmitted();
        unregisterDismissed();
      };
    },
    onlineSubscribableContext,
  );
};
