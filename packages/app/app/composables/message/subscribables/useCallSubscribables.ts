import type { OnlineSubscribableContext } from "@/composables/shared/useOnlineSubscribable";

import { getSynchronizedFunction } from "#shared/error/getSynchronizedFunction";
import { authClient } from "@/services/auth/authClient";
import { useRoomStore } from "@/store/message/room";
import { useCallStore } from "@/store/message/room/call";
import { useWebRtcStore } from "@/store/message/room/webRtc";

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
    joinCall,
    setCurrentRoomCallSessionId,
    setMute,
    setParticipants,
  } = callStore;
  const { isInCall } = storeToRefs(callStore);
  const webRtcStore = useWebRtcStore();
  const { cleanupAll, cleanupPeer, createPeerConnectionOffer } = webRtcStore;

  useOnlineSubscribable(
    currentRoomId,
    async (roomId) => {
      if (!roomId) return undefined;

      const { id: callSessionId } = await $trpc.roomCall.readCallSession.query({ roomId });
      setCurrentRoomCallSessionId(callSessionId);

      const participants = await $trpc.roomCall.readCallParticipants.query({ callSessionId });
      setParticipants(callSessionId, participants);

      if (isInCall.value) {
        const sessionId = session.value?.session.id;
        if (sessionId) deleteCallParticipant(callSessionId, sessionId);
        await joinCall();
      }

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

      return async () => {
        const sessionId = session.value?.session.id;
        if (isInCall.value) {
          await $trpc.roomCall.leaveCall.mutate({ callSessionId });
          if (sessionId) deleteCallParticipant(callSessionId, sessionId);
        }
        setCurrentRoomCallSessionId("");
        await cleanupAll();
        clearSpeakers();
        participantJoinUnsubscribable.unsubscribe();
        participantLeaveUnsubscribable.unsubscribe();
        muteChangedUnsubscribable.unsubscribe();
      };
    },
    onlineSubscribableContext,
  );
};
