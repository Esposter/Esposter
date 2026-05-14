import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { getResultAsync, noop } from "@esposter/shared";

export const useKnockerStore = defineStore("message/room/call/knocker", () => {
  const { $trpc } = useNuxtApp();
  const knockingCallSessionId = ref("");
  const knockers = ref<CallParticipant[]>([]);

  const knockCall = async (callId: string) => {
    await getResultAsync(() => $trpc.roomCall.knockCall.mutate({ id: callId })).match(() => {
      knockingCallSessionId.value = callId;
    }, console.error);
  };
  const cancelKnock = () => {
    knockingCallSessionId.value = "";
  };
  const createKnocker = (knocker: CallParticipant) => {
    if (knockers.value.some(({ id }) => id === knocker.id)) return;
    knockers.value = [...knockers.value, knocker];
  };
  const deleteKnocker = (knockerId: string) => {
    knockers.value = knockers.value.filter((knocker) => knocker.id !== knockerId);
  };
  const admitKnocker = async (callSessionId: string, sessionId: string) => {
    deleteKnocker(sessionId);
    await getResultAsync(() => $trpc.roomCall.admitKnocker.mutate({ callSessionId, sessionId })).match(
      noop,
      console.error,
    );
  };
  const dismissKnocker = async (callSessionId: string, sessionId: string) => {
    deleteKnocker(sessionId);
    await getResultAsync(() => $trpc.roomCall.dismissKnocker.mutate({ callSessionId, sessionId })).match(
      noop,
      console.error,
    );
  };
  const resetKnockerState = () => {
    knockingCallSessionId.value = "";
    knockers.value = [];
  };

  return {
    admitKnocker,
    cancelKnock,
    createKnocker,
    deleteKnocker,
    dismissKnocker,
    knockCall,
    knockers,
    knockingCallSessionId,
    resetKnockerState,
  };
});
