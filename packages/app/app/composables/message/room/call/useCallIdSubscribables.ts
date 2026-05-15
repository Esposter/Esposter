import { useCallStore } from "@/store/message/room/call";
import { getResultAsync } from "@esposter/shared";

export const useCallIdSubscribables = async (callId: string) => {
  const { $trpc } = useNuxtApp();
  const callStore = useCallStore();
  const { leaveCall } = callStore;
  const callSession = await getResultAsync(() => $trpc.roomCall.readCallSession.query({ id: callId })).match(
    (result) => result,
    () => undefined,
  );
  if (!callSession) return undefined;

  useCallJoinedSubscribables();
  useCallKnockingSubscribables(callId);

  onUnmounted(async () => {
    await leaveCall();
  });
  return callSession;
};
