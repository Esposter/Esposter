import type { Unsubscribable } from "@trpc/server/observable";

import { getUnsubscribe } from "@/services/shared/getUnsubscribe";
import { useMediaStore } from "@/store/message/room/call/media";
import { useParticipantStore } from "@/store/message/room/call/participant";

// The five participant events every view of a call session tracks, whether it is the viewed room's session
// Or the one the user has joined — the two subscribables share this core so the session is read one way
export const useSubscribeCallParticipants = () => {
  const { $trpc } = useNuxtApp();
  const mediaStore = useMediaStore();
  const { deleteParticipantVolumePercentage } = mediaStore;
  const participantStore = useParticipantStore();
  const {
    createCallParticipant,
    deleteCallParticipant,
    deleteSpeaker,
    setParticipantCameraEnabled,
    setParticipantHandRaised,
    setParticipantMuted,
  } = participantStore;

  return (callSessionId: string): Unsubscribable => ({
    unsubscribe: getUnsubscribe(
      $trpc.callSession.onJoinCall.subscribe(callSessionId, {
        onData: (participant) => {
          createCallParticipant(callSessionId, participant);
        },
      }),
      $trpc.callSession.onLeaveCall.subscribe(callSessionId, {
        onData: (participantId) => {
          deleteCallParticipant(callSessionId, participantId);
          deleteSpeaker(participantId);
          deleteParticipantVolumePercentage(participantId);
        },
      }),
      $trpc.callSession.onSetHandRaised.subscribe(callSessionId, {
        onData: ({ id: participantId, isHandRaised }) => {
          setParticipantHandRaised(callSessionId, participantId, isHandRaised);
        },
      }),
      $trpc.callSession.onSetMuted.subscribe(callSessionId, {
        onData: ({ id: participantId, isMuted }) => {
          setParticipantMuted(callSessionId, participantId, isMuted);
        },
      }),
      $trpc.callSession.onSetCameraEnabled.subscribe(callSessionId, {
        onData: ({ id: participantId, isCameraEnabled }) => {
          setParticipantCameraEnabled(callSessionId, participantId, isCameraEnabled);
        },
      }),
    ),
  });
};
