import type { OnlineSubscribableContext } from "@/composables/shared/useOnlineSubscribable";

import { getSynchronizedFunction } from "#shared/error/getSynchronizedFunction";
import { useCallStore } from "@/store/message/room/call";
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { RoutePath } from "@esposter/shared";

export const useCallKnockingSubscribables = (callId: string) => {
  const onlineSubscribableContext: OnlineSubscribableContext = {
    instance: getCurrentInstance(),
    scope: getCurrentScope(),
  };
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

      const knockerAdmittedUnsubscribable = $trpc.roomCall.onKnockerAdmitted.subscribe(callSessionId, {
        onData: getSynchronizedFunction(async () => {
          cancelKnock();
          await joinCall(callId);
        }),
      });
      const knockerDismissedUnsubscribable = $trpc.roomCall.onKnockerDismissed.subscribe(callSessionId, {
        onData: getSynchronizedFunction(async () => {
          cancelKnock();
          await navigateTo(RoutePath.CallsIndex);
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
