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

  // Knocking targets one call session at a time, so a shared executor correctly lets the latest call supersede
  const { executeMutation: executeKnockCallMutation } = useMutation();
  const knockCall = async (callId: string) => {
    const previousKnockingCallSessionId = knockingCallSessionId.value;
    await executeKnockCallMutation(() => $trpc.callSession.knocker.knockCall.mutate({ id: callId }), {
      applyOptimistic: () => {
        knockingCallSessionId.value = callId;
        return () => {
          knockingCallSessionId.value = previousKnockingCallSessionId;
        };
      },
      // A stable key so the latest knock supersedes any previous one, since only one knock is active at a time
      key: "knockCall",
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
  // Each knocker is admitted or dismissed independently, so they get an executor per call —
  // A shared one would treat the previous knocker's in-flight call as stale and swallow its rollback
  const admitKnocker = async (callSessionId: string, sessionId: string) => {
    const { executeMutation: executeAdmitKnockerMutation } = useMutation();
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
        key: sessionId,
      },
    );
  };
  const dismissKnocker = async (callSessionId: string, sessionId: string) => {
    const { executeMutation: executeDismissKnockerMutation } = useMutation();
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
        key: sessionId,
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
