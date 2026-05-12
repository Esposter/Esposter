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

      const participants = await $trpc.call.readCallParticipants.query({ roomId });
      setParticipants(roomId, participants);

      if (isInCall.value) {
        const sessionId = session.value?.session.id;
        if (sessionId) deleteCallParticipant(roomId, sessionId);
        await joinCall();
      }

      const participantJoinUnsubscribable = $trpc.call.onJoinCall.subscribe(roomId, {
        onData: getSynchronizedFunction(async (participant) => {
          createCallParticipant(roomId, participant);
          if (isInCall.value) {
            await cleanupPeer(participant.id);
            deleteSpeaker(participant.id);
            await createPeerConnectionOffer(roomId, participant.id);
          }
        }),
      });
      const participantLeaveUnsubscribable = $trpc.call.onLeaveCall.subscribe(roomId, {
        onData: getSynchronizedFunction(async (id) => {
          deleteCallParticipant(roomId, id);
          await cleanupPeer(id);
          deleteSpeaker(id);
        }),
      });
      const muteChangedUnsubscribable = $trpc.call.onSetMute.subscribe(roomId, {
        onData: (muteChange) => {
          setMute(roomId, muteChange.id, muteChange.isMuted);
        },
      });

      return async () => {
        const sessionId = session.value?.session.id;
        if (isInCall.value) {
          await $trpc.call.leaveCall.mutate({ roomId });
          if (sessionId) deleteCallParticipant(roomId, sessionId);
        }
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
