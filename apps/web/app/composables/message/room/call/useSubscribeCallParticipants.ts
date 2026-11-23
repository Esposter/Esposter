import { useMediaStore } from "#src/store/message/room/call/media";
import { useParticipantStore } from "#src/store/message/room/call/participant";
import { useRealtimeStore } from "#src/store/message/room/realtime";
import { useConnectionStore } from "#src/store/realtime/connection";

// The five participant frames the call socket carries, and the read of the session's participants. Each frame carries
// The Row the call object holds, so it arrives at its version, and each is registered before the session is read, so a
// Change The read's answer leaves out is one a frame delivers. The join frame also carries the rejoin a revoke hands
// Its own user, Which only the tab holding the meeting acts on
export const useSubscribeCallParticipants = () => {
  const { $trpc } = useNuxtApp();
  const mediaStore = useMediaStore();
  const { deleteParticipantVolumePercentage } = mediaStore;
  const participantStore = useParticipantStore();
  const { deleteSpeaker, readCallParticipants, storeCallParticipant, storeJoinedCallParticipant } = participantStore;
  const realtimeStore = useRealtimeStore();
  const { rejoin } = realtimeStore;
  const connectionStore = useConnectionStore();
  const { onCallEvent } = connectionStore;

  return async (callSessionId: string) => {
    const unregisters = [
      onCallEvent("joinCall", (data) => {
        if (data.type === "rejoin") rejoin(data.authToken, data.canPublishMicrophone);
        else storeJoinedCallParticipant(callSessionId, data.participant);
      }),
      onCallEvent("leaveCall", ({ participant }) => {
        storeCallParticipant(callSessionId, participant);
        deleteSpeaker(participant.id);
        deleteParticipantVolumePercentage(participant.id);
      }),
      ...(["handRaisedChanged", "muteChanged", "videoChanged"] as const).map((type) =>
        onCallEvent(type, ({ participant }) => {
          storeCallParticipant(callSessionId, participant);
        }),
      ),
    ];
    await readCallParticipants(callSessionId, () => $trpc.callSession.readCallParticipantMap.query({ callSessionId }));
    return () => {
      for (const unregister of unregisters) unregister();
    };
  };
};
