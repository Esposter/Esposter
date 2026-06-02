import type { OnlineSubscribableContext } from "@/composables/shared/useOnlineSubscribable";

import { useRoomStore } from "@/store/message/room";
import { useCallStore } from "@/store/message/room/call";
import { useParticipantStore } from "@/store/message/room/call/participant";

export const useCallSubscribables = () => {
  const onlineSubscribableContext: OnlineSubscribableContext = {
    instance: getCurrentInstance(),
    scope: getCurrentScope(),
  };
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
    setHandRaised,
    setMute,
    setParticipantCamera,
    setParticipantMap,
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

      const participantJoinUnsubscribable = $trpc.callSession.onJoinCall.subscribe(callSessionId, {
        onData: (participant) => {
          createCallParticipant(callSessionId, participant);
        },
      });
      const participantLeaveUnsubscribable = $trpc.callSession.onLeaveCall.subscribe(callSessionId, {
        onData: (id) => {
          deleteCallParticipant(callSessionId, id);
          deleteSpeaker(id);
        },
      });
      const handRaisedChangedUnsubscribable = $trpc.callSession.onHandRaisedChanged.subscribe(callSessionId, {
        onData: ({ id, isHandRaised }) => {
          setHandRaised(callSessionId, id, isHandRaised);
        },
      });
      const muteChangedUnsubscribable = $trpc.callSession.onSetMute.subscribe(callSessionId, {
        onData: (muteChange) => {
          setMute(callSessionId, muteChange.id, muteChange.isMuted);
        },
      });
      const videoChangedUnsubscribable = $trpc.callSession.onVideoChanged.subscribe(callSessionId, {
        onData: ({ id, isCameraEnabled }) => {
          setParticipantCamera(callSessionId, id, isCameraEnabled);
        },
      });

      return () => {
        setCurrentRoomCallSessionId("");
        clearSpeakers();
        participantJoinUnsubscribable.unsubscribe();
        participantLeaveUnsubscribable.unsubscribe();
        handRaisedChangedUnsubscribable.unsubscribe();
        muteChangedUnsubscribable.unsubscribe();
        videoChangedUnsubscribable.unsubscribe();
      };
    },
    onlineSubscribableContext,
  );
};
