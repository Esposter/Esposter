import { useCallStore } from "@/store/message/room/call";
import { getResultAsync } from "@esposter/shared";

export const useCallIdSubscribables = async (callId: string) => {
  const { $trpc } = useNuxtApp();
  const callStore = useCallStore();
  const { leaveCall } = callStore;
  const isCallSessionValid = await getResultAsync(() => $trpc.roomCall.readCallSession.query({ id: callId })).match(
    () => true,
    () => false,
  );
  if (!isCallSessionValid) return false;

  useCallJoinedSubscribables();
  useCallKnockingSubscribables(callId);

  onUnmounted(async () => {
    await leaveCall();
  });
  return true;
};
