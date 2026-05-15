import { getResultAsync } from "@esposter/shared";
import { useCallStore } from "@/store/message/room/call";
import { useKnockerStore } from "@/store/message/room/call/knocker";

export const useCallIdSubscribables = async (callId: string) => {
  const { $trpc } = useNuxtApp();
  const callStore = useCallStore();
  const { activeCallSessionId } = storeToRefs(callStore);
  const { leaveCall } = callStore;
  const knockerStore = useKnockerStore();
  const { knockingCallSessionId } = storeToRefs(knockerStore);
  const { cancelKnock } = knockerStore;
  const callSession = await getResultAsync(() => $trpc.callSession.readCallSession.query({ id: callId })).match(
    (result) => result,
    () => undefined,
  );
  if (!callSession) return undefined;

  useCallJoinedSubscribables();
  useCallKnockingSubscribables(callId);

  onUnmounted(async () => {
    if (!activeCallSessionId.value && knockingCallSessionId.value === callId) cancelKnock();
    await leaveCall();
  });
  return callSession;
};
