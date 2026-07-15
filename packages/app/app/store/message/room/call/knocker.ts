import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { JoinCallOptions } from "@/models/message/room/call/JoinCallOptions";

import { useMutation } from "@/composables/shared/useMutation";

export const useKnockerStore = defineStore("message/room/call/knocker", () => {
  const { $trpc } = useNuxtApp();
  const knockingCallSessionId = ref("");
  const joinCallOptions = ref<JoinCallOptions>({
    isCameraEnabled: false,
    isMicrophoneEnabled: true,
  });
  const knockers = ref<CallParticipant[]>([]);

  const executeKnockCallMutation = useMutation();
  const executeAdmitKnockerMutation = useMutation();
  const executeDismissKnockerMutation = useMutation();
  const knockCall = async (callId: string) => {
    const previousKnockingCallSessionId = knockingCallSessionId.value;
    await executeKnockCallMutation(() => $trpc.callSession.knocker.knockCall.mutate({ id: callId }), {
      applyOptimistic: () => {
        knockingCallSessionId.value = callId;
        return () => {
          knockingCallSessionId.value = previousKnockingCallSessionId;
        };
      },
    });
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
    const previousKnockers = knockers.value;
    await executeAdmitKnockerMutation(
      () => $trpc.callSession.knocker.admitKnocker.mutate({ callSessionId, sessionId }),
      {
        applyOptimistic: () => {
          deleteKnocker(sessionId);
          return () => {
            knockers.value = previousKnockers;
          };
        },
      },
    );
  };
  const dismissKnocker = async (callSessionId: string, sessionId: string) => {
    const previousKnockers = knockers.value;
    await executeDismissKnockerMutation(
      () => $trpc.callSession.knocker.dismissKnocker.mutate({ callSessionId, sessionId }),
      {
        applyOptimistic: () => {
          deleteKnocker(sessionId);
          return () => {
            knockers.value = previousKnockers;
          };
        },
      },
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
