import type { OnlineSubscribableContext } from "@/composables/shared/useOnlineSubscribable";

import { authClient } from "@/services/auth/authClient";
import { useRoomStore } from "@/store/message/room";
import { useCallStore } from "@/store/message/room/call";

export const useCallSubscribables = async () => {
  const onlineSubscribableContext: OnlineSubscribableContext = {
    instance: getCurrentInstance(),
    scope: getCurrentScope(),
  };
  const { $trpc } = useNuxtApp();
  const { data: session } = await authClient.useSession(useFetch);
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const callStore = useCallStore();
  const {
    clearSpeakers,
    createCallParticipant,
    deleteCallParticipant,
    deleteSpeaker,
    joinCallByRoomId,
    setCurrentRoomCallSessionId,
    setMute,
    setParticipantCamera,
    setParticipants,
  } = callStore;
  const { isInCall } = storeToRefs(callStore);

  useOnlineSubscribable(
    currentRoomId,
    async (roomId) => {
      if (!roomId) return undefined;

      const callSessionId = await $trpc.roomCall.readCallSessionId.query({ roomId });
      setCurrentRoomCallSessionId(callSessionId);
      if (!callSessionId) return undefined;

      const participants = await $trpc.roomCall.readCallParticipants.query({ callSessionId });
      setParticipants(callSessionId, participants);

      if (isInCall.value) {
        const sessionId = session.value?.session.id;
        if (sessionId) deleteCallParticipant(callSessionId, sessionId);
        await joinCallByRoomId();
      }

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

      return async () => {
        const sessionId = session.value?.session.id;
        if (isInCall.value) {
          await $trpc.roomCall.leaveCall.mutate({ callSessionId });
          if (sessionId) deleteCallParticipant(callSessionId, sessionId);
        }
        setCurrentRoomCallSessionId("");
        clearSpeakers();
        participantJoinUnsubscribable.unsubscribe();
        participantLeaveUnsubscribable.unsubscribe();
        muteChangedUnsubscribable.unsubscribe();
        videoChangedUnsubscribable.unsubscribe();
      };
    },
    onlineSubscribableContext,
  );
};
