import { useCallStore } from "@/store/message/room/call";
import { useCallParticipantStore } from "@/store/message/room/call/participant";

export const useCallIdSubscribables = async (id: string) => {
  const { $trpc } = useNuxtApp();
  const callStore = useCallStore();
  const { joinCall, leaveCall } = callStore;
  const participantStore = useCallParticipantStore();
  const { createCallParticipant, deleteCallParticipant, deleteSpeaker, setMute, setParticipantCamera } =
    participantStore;

  const callSessionId = await joinCall(id);
  if (!callSessionId) return false;

  const participantJoinUnsubscribable = $trpc.roomCall.onJoinCall.subscribe(callSessionId, {
    onData: (participant) => {
      createCallParticipant(callSessionId, participant);
    },
  });
  const participantLeaveUnsubscribable = $trpc.roomCall.onLeaveCall.subscribe(callSessionId, {
    onData: (id) => {
      deleteCallParticipant(callSessionId, id);
      deleteSpeaker(id);
    },
  });
  const muteChangedUnsubscribable = $trpc.roomCall.onSetMute.subscribe(callSessionId, {
    onData: (muteChange) => {
      setMute(callSessionId, muteChange.id, muteChange.isMuted);
    },
  });
  const videoChangedUnsubscribable = $trpc.roomCall.onVideoChanged.subscribe(callSessionId, {
    onData: ({ id, isCameraEnabled }) => {
      setParticipantCamera(callSessionId, id, isCameraEnabled);
    },
  });

  onUnmounted(async () => {
    participantJoinUnsubscribable.unsubscribe();
    participantLeaveUnsubscribable.unsubscribe();
    muteChangedUnsubscribable.unsubscribe();
    videoChangedUnsubscribable.unsubscribe();
    await leaveCall();
  });

  return true;
};
