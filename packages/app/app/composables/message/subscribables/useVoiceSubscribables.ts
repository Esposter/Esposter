import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { authClient } from "@/services/auth/authClient";
import { useRoomStore } from "@/store/message/room";
import { useVoiceStore } from "@/store/message/room/voice";
import { useWebRtcStore } from "@/store/message/room/webRtc";

export const useVoiceSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const session = authClient.useSession();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const voiceStore = useVoiceStore();
  const { createVoiceParticipant, deleteVoiceParticipant, joinVoice, setMute, setParticipants } = voiceStore;
  const { isInChannel } = storeToRefs(voiceStore);
  const webRtcStore = useWebRtcStore();
  const { cleanupPeer, createPeerConnectionOffer, deleteSpeaker } = webRtcStore;

  useOnlineSubscribable(currentRoomId, async (roomId) => {
    if (!roomId) return undefined;

    const participants = await $trpc.voice.readVoiceParticipants.query({ roomId });
    setParticipants(roomId, participants);

    if (isInChannel.value) {
      const sessionId = session.value.data?.session.id;
      if (sessionId) deleteVoiceParticipant(roomId, sessionId);
      await joinVoice();
    }

    const participantJoinUnsubscribable = $trpc.voice.onParticipantJoin.subscribe(roomId, {
      onData: getSynchronizedFunction(async (participant) => {
        createVoiceParticipant(roomId, participant);
        if (isInChannel.value) {
          await cleanupPeer(participant.id);
          deleteSpeaker(participant.id);
          await createPeerConnectionOffer(roomId, participant.id);
        }
      }),
    });
    const participantLeaveUnsubscribable = $trpc.voice.onParticipantLeave.subscribe(roomId, {
      onData: getSynchronizedFunction(async (id) => {
        deleteVoiceParticipant(roomId, id);
        await cleanupPeer(id);
        deleteSpeaker(id);
      }),
    });
    const muteChangedUnsubscribable = $trpc.voice.onMuteChanged.subscribe(roomId, {
      onData: (muteChange) => {
        setMute(roomId, muteChange.id, muteChange.isMuted);
      },
    });

    return async () => {
      const sessionId = session.value.data?.session.id;
      if (isInChannel.value) {
        await $trpc.voice.leaveVoiceChannel.mutate({ roomId });
        if (sessionId) deleteVoiceParticipant(roomId, sessionId);
      }
      await webRtcStore.cleanupAll();
      voiceStore.clearSpeakers();
      participantJoinUnsubscribable.unsubscribe();
      participantLeaveUnsubscribable.unsubscribe();
      muteChangedUnsubscribable.unsubscribe();
    };
  });
};
