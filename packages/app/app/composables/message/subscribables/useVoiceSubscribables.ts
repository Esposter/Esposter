import type { OnlineSubscribableContext } from "@/composables/shared/useOnlineSubscribable";

import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { authClient } from "@/services/auth/authClient";
import { useRoomStore } from "@/store/message/room";
import { useVoiceStore } from "@/store/message/room/voice";
import { useWebRtcStore } from "@/store/message/room/webRtc";

export const useVoiceSubscribables = async () => {
  const onlineSubscribableContext: OnlineSubscribableContext = {
    instance: getCurrentInstance(),
    scope: getCurrentScope(),
  };
  const { $trpc } = useNuxtApp();
  const { data: session } = await authClient.useSession(useFetch);
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const voiceStore = useVoiceStore();
  const {
    clearSpeakers,
    createVoiceParticipant,
    deleteSpeaker,
    deleteVoiceParticipant,
    joinVoice,
    setMute,
    setParticipants,
  } = voiceStore;
  const { isInChannel } = storeToRefs(voiceStore);
  const webRtcStore = useWebRtcStore();
  const { cleanupAll, cleanupPeer, createPeerConnectionOffer } = webRtcStore;

  useOnlineSubscribable(
    currentRoomId,
    async (roomId) => {
      if (!roomId) return undefined;

      const participants = await $trpc.voice.readVoiceParticipants.query({ roomId });
      setParticipants(roomId, participants);

      if (isInChannel.value) {
        const sessionId = session.value?.session.id;
        if (sessionId) deleteVoiceParticipant(roomId, sessionId);
        await joinVoice();
      }

      const participantJoinUnsubscribable = $trpc.voice.onJoinVoiceChannel.subscribe(roomId, {
        onData: getSynchronizedFunction(async (participant) => {
          createVoiceParticipant(roomId, participant);
          if (isInChannel.value) {
            await cleanupPeer(participant.id);
            deleteSpeaker(participant.id);
            await createPeerConnectionOffer(roomId, participant.id);
          }
        }),
      });
      const participantLeaveUnsubscribable = $trpc.voice.onLeaveVoiceChannel.subscribe(roomId, {
        onData: getSynchronizedFunction(async (id) => {
          deleteVoiceParticipant(roomId, id);
          await cleanupPeer(id);
          deleteSpeaker(id);
        }),
      });
      const muteChangedUnsubscribable = $trpc.voice.onSetMute.subscribe(roomId, {
        onData: (muteChange) => {
          setMute(roomId, muteChange.id, muteChange.isMuted);
        },
      });

      return async () => {
        const sessionId = session.value?.session.id;
        if (isInChannel.value) {
          await $trpc.voice.leaveVoiceChannel.mutate({ roomId });
          if (sessionId) deleteVoiceParticipant(roomId, sessionId);
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
