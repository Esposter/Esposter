import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { JoinCallOptions } from "@/models/message/room/call/JoinCallOptions";

import { getResultAsync } from "@esposter/shared";

export const useKnockerStore = defineStore("message/room/call/knocker", () => {
  const { $trpc } = useNuxtApp();
  const knockingCallSessionId = ref("");
  const joinCallOptions = ref<JoinCallOptions>({
    isCameraEnabled: false,
    isMicrophoneEnabled: true,
  });
  const knockers = ref<CallParticipant[]>([]);

  const knockCall = async (callId: string) => {
    await getResultAsync(() => $trpc.callSession.knocker.knockCall.mutate({ id: callId })).match(() => {
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
    await getResultAsync(() => $trpc.callSession.knocker.admitKnocker.mutate({ callSessionId, sessionId })).match(
      () => {
        deleteKnocker(sessionId);
      },
      console.error,
    );
  };
  const dismissKnocker = async (callSessionId: string, sessionId: string) => {
    await getResultAsync(() => $trpc.callSession.knocker.dismissKnocker.mutate({ callSessionId, sessionId })).match(
      () => {
        deleteKnocker(sessionId);
      },
      console.error,
    );
  };
  const resetKnockerState = () => {
    knockingCallSessionId.value = "";
    joinCallOptions.value = {
      isCameraEnabled: false,
      isMicrophoneEnabled: true,
    };
    knockers.value = [];
  };

  return {
    admitKnocker,
    cancelKnock,
    createKnocker,
    deleteKnocker,
    dismissKnocker,
    joinCallOptions,
    knockCall,
    knockers,
    knockingCallSessionId,
    resetKnockerState,
  };
});
