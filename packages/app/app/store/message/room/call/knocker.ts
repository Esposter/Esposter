import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { JoinCallOptions } from "@/models/message/room/call/JoinCallOptions";

import { getResultAsync } from "@esposter/shared";

const defaultJoinCallOptions: JoinCallOptions = {
  isCameraEnabled: false,
  isMicrophoneEnabled: true,
};

export const useKnockerStore = defineStore("message/room/call/knocker", () => {
  const { $trpc } = useNuxtApp();
  const knockingCallSessionId = ref("");
  const joinCallOptions = ref<JoinCallOptions>(defaultJoinCallOptions);
  const knockers = ref<CallParticipant[]>([]);

  const knockCall = async (callId: string, newJoinCallOptions: JoinCallOptions) => {
    await getResultAsync(() => $trpc.roomCall.knockCall.mutate({ id: callId })).match(() => {
      joinCallOptions.value = newJoinCallOptions;
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
    await getResultAsync(() => $trpc.roomCall.admitKnocker.mutate({ callSessionId, sessionId })).match(() => {
      deleteKnocker(sessionId);
    }, console.error);
  };
  const dismissKnocker = async (callSessionId: string, sessionId: string) => {
    await getResultAsync(() => $trpc.roomCall.dismissKnocker.mutate({ callSessionId, sessionId })).match(() => {
      deleteKnocker(sessionId);
    }, console.error);
  };
  const resetKnockerState = () => {
    knockingCallSessionId.value = "";
    joinCallOptions.value = defaultJoinCallOptions;
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
