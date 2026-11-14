import { useMediaStore } from "@/store/message/room/call/media";
import { useParticipantStore } from "@/store/message/room/call/participant";
import { useRealtimeStore } from "@/store/message/room/realtime";
import { useConnectionStore } from "@/store/realtime/connection";

// The five participant frames the call socket carries, and the read of the session's participants. Each frame is
// Registered before the session is read, so a change the read's answer leaves out is one a frame delivers. The join
// Frame also carries the rejoin a revoke hands its own user, which only the tab holding the meeting acts on
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
  const realtimeStore = useRealtimeStore();
  const { rejoin } = realtimeStore;
  const connectionStore = useConnectionStore();
  const { onCallEvent } = connectionStore;

  return async (callSessionId: string) => {
    const unregisters = [
      onCallEvent("joinCall", (data) => {
        if (data.type === "rejoin") rejoin(data.authToken, data.canPublishMicrophone);
        else createCallParticipant(callSessionId, data.participant);
      }),
      onCallEvent("leaveCall", ({ id }) => {
        deleteCallParticipant(callSessionId, id);
        deleteSpeaker(id);
        deleteParticipantVolumePercentage(id);
      }),
      onCallEvent("handRaisedChanged", ({ id, isHandRaised }) => {
        setParticipantHandRaised(callSessionId, id, isHandRaised);
      }),
      onCallEvent("muteChanged", ({ id, isMuted }) => {
        setParticipantMuted(callSessionId, id, isMuted);
      }),
      onCallEvent("videoChanged", ({ id, isCameraEnabled }) => {
        setParticipantCameraEnabled(callSessionId, id, isCameraEnabled);
      }),
    ];
    await readCallParticipants(callSessionId, () => $trpc.callSession.readCallParticipantMap.query({ callSessionId }));
    return () => {
      for (const unregister of unregisters) unregister();
    };
  };
};
