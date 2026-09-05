import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { JoinCallOptions } from "@/models/message/room/call/JoinCallOptions";

// A fresh object per call — the pre-join sheet edits it in place, so a shared one would carry the previous
// Call's choices into the next lobby
const getDefaultJoinCallOptions = (): JoinCallOptions => ({ isCameraEnabled: false, isMicrophoneEnabled: true });

export const useKnockerStore = defineStore("message/room/call/knocker", () => {
  const { $trpc } = useNuxtApp();
  const knockingCallSessionId = ref("");
  const joinCallOptions = ref<JoinCallOptions>(getDefaultJoinCallOptions());
  const knockers = ref<CallParticipant[]>([]);
  // Knocking targets one call session at a time, so every knock shares one executor and one target
  const { executeMutation: executeKnockCallMutation } = useMutation();
  const knockCall = async (callId: string) => {
    await executeKnockCallMutation(() => $trpc.callSession.knocker.knockCall.mutate({ id: callId }), {
      // Read as the write is sent: knocks share one target and queue, so a rejected one must unwind to the
      // Session the knock ahead of it stored rather than to the one held when the user clicked
      applyOptimistic: () => {
        const previousKnockingCallSessionId = knockingCallSessionId.value;
        knockingCallSessionId.value = callId;
        return () => {
          knockingCallSessionId.value = previousKnockingCallSessionId;
        };
      },
      // Only one knock is active at a time, so it is a singleton target: a stable key, and knocks run one after
      // The other against it
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
  // Admitting and dismissing differ only in the write they send: both take one knocker out of the lobby, and
  // Both put back that one knocker where it stood if the write is rejected
  const getResolveKnockerOptions = (sessionId: string) => ({
    applyOptimistic: () => {
      const deletedIndex = knockers.value.findIndex(({ id }) => id === sessionId);
      const deletedKnocker = knockers.value[deletedIndex];
      deleteKnocker(sessionId);
      return () => {
        if (!deletedKnocker || knockers.value.some(({ id }) => id === deletedKnocker.id)) return;

        knockers.value = knockers.value.toSpliced(Math.min(deletedIndex, knockers.value.length), 0, deletedKnocker);
      };
    },
    key: sessionId,
  });
  const { executeMutation: executeAdmitKnockerMutation } = useMutation();
  const admitKnocker = async (callSessionId: string, sessionId: string) => {
    await executeAdmitKnockerMutation(
      () => $trpc.callSession.knocker.admitKnocker.mutate({ callSessionId, sessionId }),
      getResolveKnockerOptions(sessionId),
    );
  };
  const { executeMutation: executeDismissKnockerMutation } = useMutation();
  const dismissKnocker = async (callSessionId: string, sessionId: string) => {
    await executeDismissKnockerMutation(
      () => $trpc.callSession.knocker.dismissKnocker.mutate({ callSessionId, sessionId }),
      getResolveKnockerOptions(sessionId),
    );
  };
  const resetKnockerState = () => {
    knockingCallSessionId.value = "";
    joinCallOptions.value = getDefaultJoinCallOptions();
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
