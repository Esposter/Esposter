import { useCallStore } from "@/store/message/room/call";
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { useMediaStore } from "@/store/message/room/call/media";
import { getResultAsync } from "@esposter/shared";

export const useCallIdSubscribables = async (callId: string) => {
  const onlineSubscribableContext = getOnlineSubscribableContext();
  const { $trpc } = useNuxtApp();
  const callStore = useCallStore();
  const { activeCallSessionId } = storeToRefs(callStore);
  const { leaveCall } = callStore;
  const knockerStore = useKnockerStore();
  const { knockingCallSessionId } = storeToRefs(knockerStore);
  const { cancelKnock } = knockerStore;
  const mediaStore = useMediaStore();
  const { isPoppedOut } = storeToRefs(mediaStore);
  // The page renders its own "call not found" for an absent session, so a failed read degrades to the same
  // Screen rather than an error one — but a read that failed is not a call that is missing, and only the log
  // Tells the two apart
  const callSession = await getResultAsync(() => $trpc.callSession.readCallSession.query({ id: callId }))
    .orTee(console.error)
    .unwrapOr(undefined);
  if (!callSession) return undefined;

  useCallJoinedSubscribables(onlineSubscribableContext);
  useCallKnockingSubscribables(callId, onlineSubscribableContext);

  onUnmounted(async () => {
    // Popping out keeps a standalone call alive while the user navigates away; the PiP window owns the call surface.
    if (isPoppedOut.value) return;
    if (!activeCallSessionId.value && knockingCallSessionId.value === callId) cancelKnock();
    await leaveCall();
  }, onlineSubscribableContext.instance);
  return callSession;
};
