import type { Unsubscribable } from "@trpc/server/observable";

import { getUnsubscribe } from "@/services/shared/getUnsubscribe";
import { subscribeStarted } from "@/services/shared/subscribeStarted";
import { useMediaStore } from "@/store/message/room/call/media";
import { useParticipantStore } from "@/store/message/room/call/participant";

// The five participant events every view of a call session tracks, whether it is the viewed room's session
// Or the one the user has joined — the two subscribables share this core so the session is read one way. Each event
// Is started before the session is read, so a change the read's answer leaves out is one the subscription delivers
export const useSubscribeCallParticipants = () => {
  const { $trpc } = useNuxtApp();
  const mediaStore = useMediaStore();
  const { deleteParticipantVolumePercentage } = mediaStore;
  const participantStore = useParticipantStore();
  const {
    createCallParticipant,
    deleteCallParticipant,
    deleteSpeaker,
    readCallParticipants,
    setParticipantCameraEnabled,
    setParticipantHandRaised,
    setParticipantMuted,
  } = participantStore;

  return async (callSessionId: string): Promise<Unsubscribable> => {
    const subscriptions = await Promise.all([
      subscribeStarted((handlers) =>
        $trpc.callSession.onJoinCall.subscribe(callSessionId, {
          onData: (participant) => {
            createCallParticipant(callSessionId, participant);
          },
          ...handlers,
        }),
      ),
      subscribeStarted((handlers) =>
        $trpc.callSession.onLeaveCall.subscribe(callSessionId, {
          onData: (participantId) => {
            deleteCallParticipant(callSessionId, participantId);
            deleteSpeaker(participantId);
            deleteParticipantVolumePercentage(participantId);
          },
          ...handlers,
        }),
      ),
      subscribeStarted((handlers) =>
        $trpc.callSession.onSetHandRaised.subscribe(callSessionId, {
          onData: ({ id: participantId, isHandRaised }) => {
            setParticipantHandRaised(callSessionId, participantId, isHandRaised);
          },
          ...handlers,
        }),
      ),
      subscribeStarted((handlers) =>
        $trpc.callSession.onSetMuted.subscribe(callSessionId, {
          onData: ({ id: participantId, isMuted }) => {
            setParticipantMuted(callSessionId, participantId, isMuted);
          },
          ...handlers,
        }),
      ),
      subscribeStarted((handlers) =>
        $trpc.callSession.onSetCameraEnabled.subscribe(callSessionId, {
          onData: ({ id: participantId, isCameraEnabled }) => {
            setParticipantCameraEnabled(callSessionId, participantId, isCameraEnabled);
          },
          ...handlers,
        }),
      ),
    ]);
    await readCallParticipants(callSessionId, () => $trpc.callSession.readCallParticipantMap.query({ callSessionId }));
    return { unsubscribe: getUnsubscribe(...subscriptions) };
  };
};
