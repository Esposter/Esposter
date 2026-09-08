import { getUnsubscribe } from "@/services/shared/getUnsubscribe";
import { useRoomStore } from "@/store/message/room";
import { useCallStore } from "@/store/message/room/call";
import { useParticipantStore } from "@/store/message/room/call/participant";

export const useCallSubscribables = () => {
  const onlineSubscribableContext = getOnlineSubscribableContext();
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const callStore = useCallStore();
  const { setCurrentRoomCallSessionId } = callStore;
  const participantStore = useParticipantStore();
  const {
    clearSpeakers,
    createCallParticipant,
    deleteCallParticipant,
    deleteSpeaker,
    setParticipantCameraEnabled,
    setParticipantHandRaised,
    setParticipantMap,
    setParticipantMuted,
  } = participantStore;

  useOnlineSubscribable(
    currentRoomId,
    async (roomId) => {
      if (!roomId) return undefined;

      const callSessionId = await $trpc.callSession.readCallSessionId.query({ roomId });
      setCurrentRoomCallSessionId(callSessionId);
      if (!callSessionId) return undefined;

      const participantMap = await $trpc.callSession.readCallParticipantMap.query({ callSessionId });
      setParticipantMap(callSessionId, participantMap);

      const unsubscribe = getUnsubscribe(
        $trpc.callSession.onJoinCall.subscribe(callSessionId, {
          onData: (participant) => {
            createCallParticipant(callSessionId, participant);
          },
        }),
        $trpc.callSession.onLeaveCall.subscribe(callSessionId, {
          onData: (id) => {
            deleteCallParticipant(callSessionId, id);
            deleteSpeaker(id);
          },
        }),
        $trpc.callSession.onSetHandRaised.subscribe(callSessionId, {
          onData: ({ id, isHandRaised }) => {
            setParticipantHandRaised(callSessionId, id, isHandRaised);
          },
        }),
        $trpc.callSession.onSetMuted.subscribe(callSessionId, {
          onData: ({ id, isMuted }) => {
            setParticipantMuted(callSessionId, id, isMuted);
          },
        }),
        $trpc.callSession.onSetCameraEnabled.subscribe(callSessionId, {
          onData: ({ id, isCameraEnabled }) => {
            setParticipantCameraEnabled(callSessionId, id, isCameraEnabled);
          },
        }),
      );

      return () => {
        setCurrentRoomCallSessionId("");
        clearSpeakers();
        unsubscribe();
      };
    },
    onlineSubscribableContext,
  );
};
