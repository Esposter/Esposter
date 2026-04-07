import type { VoiceParticipant } from "#shared/models/room/voice/VoiceParticipant";

import { authClient } from "@/services/auth/authClient";
import { useRoomStore } from "@/store/message/room";

export const useVoiceStore = defineStore("message/room/voice", () => {
  const voiceParticipantsRoomMap = ref(new Map<string, VoiceParticipant[]>());
  const speakingIds = ref<string[]>([]);
  const roomStore = useRoomStore();
  const session = authClient.useSession();
  const sessionId = computed(() => session.value.data?.session.id);
  const roomParticipants = computed(() =>
    roomStore.currentRoomId ? (voiceParticipantsRoomMap.value.get(roomStore.currentRoomId) ?? []) : [],
  );
  const isInChannel = computed(() => roomParticipants.value.some(({ id }) => id === sessionId.value));
  const isMuted = computed(() => roomParticipants.value.find(({ id }) => id === sessionId.value)?.isMuted ?? false);
  const joinVoice = (roomId: string, participant: VoiceParticipant) => {
    const participants = voiceParticipantsRoomMap.value.get(roomId) ?? [];
    if (participants.some(({ id }) => id === participant.id)) return;
    voiceParticipantsRoomMap.value.set(roomId, [...participants, participant]);
  };
  const leaveVoice = (roomId: string, id: string) => {
    const participants = voiceParticipantsRoomMap.value.get(roomId);
    if (!participants) return;
    voiceParticipantsRoomMap.value.set(
      roomId,
      participants.filter((p) => p.id !== id),
    );
  };
  const setMute = (roomId: string, id: string, isMuted: boolean) => {
    const participants = voiceParticipantsRoomMap.value.get(roomId);
    if (!participants) return;
    const participant = participants.find((p) => p.id === id);
    if (!participant) return;
    participant.isMuted = isMuted;
  };
  const setParticipants = (roomId: string, participants: VoiceParticipant[]) => {
    voiceParticipantsRoomMap.value.set(roomId, participants);
  };
  const createSpeaker = (id: string) => {
    if (speakingIds.value.includes(id)) return;
    speakingIds.value = [...speakingIds.value, id];
  };
  const deleteSpeaker = (id: string) => {
    speakingIds.value = speakingIds.value.filter((speakingId) => speakingId !== id);
  };
  const clearSpeakers = () => {
    speakingIds.value = [];
  };
  return {
    clearSpeakers,
    createSpeaker,
    deleteSpeaker,
    isInChannel,
    isMuted,
    joinVoice,
    leaveVoice,
    setMute,
    setParticipants,
    speakingIds,
    voiceParticipantsRoomMap,
  };
});
