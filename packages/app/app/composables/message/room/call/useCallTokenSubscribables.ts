import { getSynchronizedFunction } from "#shared/error/getSynchronizedFunction";
import { useCallStore } from "@/store/message/room/call";
import { useWebRtcStore } from "@/store/message/room/webRtc";

export const useCallTokenSubscribables = async (token: string) => {
  const { $trpc } = useNuxtApp();
  const callStore = useCallStore();
  const { createCallParticipant, deleteCallParticipant, deleteSpeaker, joinCallByToken, leaveCall, setMute } =
    callStore;
  const { isInCall } = storeToRefs(callStore);
  const webRtcStore = useWebRtcStore();
  const { cleanupPeer, createPeerConnectionOffer } = webRtcStore;

  const callSessionId = await joinCallByToken(token);
  if (!callSessionId) return false;

  const participantJoinUnsubscribable = $trpc.roomCall.onJoinCall.subscribe(callSessionId, {
    onData: getSynchronizedFunction(async (participant) => {
      createCallParticipant(callSessionId, participant);
      if (isInCall.value) {
        await cleanupPeer(participant.id);
        deleteSpeaker(participant.id);
        await createPeerConnectionOffer(callSessionId, participant.id);
      }
    }),
  });
  const participantLeaveUnsubscribable = $trpc.roomCall.onLeaveCall.subscribe(callSessionId, {
    onData: getSynchronizedFunction(async (id) => {
      deleteCallParticipant(callSessionId, id);
      await cleanupPeer(id);
      deleteSpeaker(id);
    }),
  });
  const muteChangedUnsubscribable = $trpc.roomCall.onSetMute.subscribe(callSessionId, {
    onData: (muteChange) => {
      setMute(callSessionId, muteChange.id, muteChange.isMuted);
    },
  });

  onUnmounted(async () => {
    participantJoinUnsubscribable.unsubscribe();
    participantLeaveUnsubscribable.unsubscribe();
    muteChangedUnsubscribable.unsubscribe();
    await leaveCall();
  });

  return true;
};
