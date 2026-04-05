import type { VoiceParticipant } from "#shared/models/room/voice/VoiceParticipant";

export const useVoiceStore = defineStore("message/voice", () => {
  const voiceParticipantsRoomMap = ref<Map<string, VoiceParticipant[]>>(new Map<string, VoiceParticipant[]>());
  const speakingUserIds = ref<string[]>([]);
  const joinVoice = (roomId: string, participant: VoiceParticipant) => {
    const current = voiceParticipantsRoomMap.value.get(roomId) ?? [];
    if (current.some(({ id }) => id === participant.id)) return;
    voiceParticipantsRoomMap.value.set(roomId, [...current, participant]);
  };
  const leaveVoice = (roomId: string, id: string) => {
    const current = voiceParticipantsRoomMap.value.get(roomId);
    if (!current) return;
    voiceParticipantsRoomMap.value.set(
      roomId,
      current.filter((p) => p.id !== id),
    );
  };
  const setMute = (roomId: string, id: string, isMuted: boolean) => {
    const participant = voiceParticipantsRoomMap.value.get(roomId)?.find((p) => p.id === id);
    if (!participant) return;
    participant.isMuted = isMuted;
  };
  const setParticipants = (roomId: string, participants: VoiceParticipant[]) => {
    voiceParticipantsRoomMap.value.set(roomId, participants);
  };
  const createSpeakingUser = (id: string) => {
    if (speakingUserIds.value.includes(id)) return;
    speakingUserIds.value = [...speakingUserIds.value, id];
  };
  const deleteSpeakingUser = (id: string) => {
    speakingUserIds.value = speakingUserIds.value.filter((speakingId) => speakingId !== id);
  };
  const clearSpeakingUsers = () => {
    speakingUserIds.value = [];
  };
  return {
    clearSpeakingUsers,
    createSpeakingUser,
    deleteSpeakingUser,
    joinVoice,
    leaveVoice,
    setMute,
    setParticipants,
    speakingUserIds,
    voiceParticipantsRoomMap,
  };
});
