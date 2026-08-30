import type { OnlineSubscribableContext } from "@/composables/shared/useOnlineSubscribable";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { useCallStore } from "@/store/message/room/call";
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { getResultAsync, noop, RoutePath } from "@esposter/shared";

export const useCallKnockingSubscribables = (callId: string, onlineSubscribableContext: OnlineSubscribableContext) => {
  const { $trpc } = useNuxtApp();
  const callStore = useCallStore();
  const { joinCall } = callStore;
  const knockerStore = useKnockerStore();
  const { knockingCallSessionId } = storeToRefs(knockerStore);
  const { cancelKnock } = knockerStore;

  useOnlineSubscribable(
    knockingCallSessionId,
    (callSessionId) => {
      if (!callSessionId) return undefined;

      const knockerAdmittedUnsubscribable = $trpc.callSession.knocker.onKnockerAdmitted.subscribe(callSessionId, {
        // Neither call can reject — `joinCall` unwinds and alerts its own failure — so there is nothing here
        // For a terminator to hold, and a failed admit leaves the user on the pre-join screen they knocked from
        onData: getSynchronizedFunction(async () => {
          cancelKnock();
          await joinCall(callId);
        }),
      });
      const knockerDismissedUnsubscribable = $trpc.callSession.knocker.onKnockerDismissed.subscribe(callSessionId, {
        onData: getSynchronizedFunction(async () => {
          await getResultAsync(async () => {
            cancelKnock();
            await navigateTo(RoutePath.CallsIndex);
          }).match(noop, console.error);
        }),
      });

      return () => {
        knockerAdmittedUnsubscribable.unsubscribe();
        knockerDismissedUnsubscribable.unsubscribe();
      };
    },
    onlineSubscribableContext,
  );
};
