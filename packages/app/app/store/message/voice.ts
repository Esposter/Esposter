import type { VoiceParticipant } from "#shared/models/room/voice/VoiceParticipant";

export const useVoiceStore = defineStore("message/voice", () => {
  const participantsByRoom = ref<Record<string, VoiceParticipant[]>>({});
  const speakingUserIds = ref<string[]>([]);

  const joinVoice = (roomId: string, participant: VoiceParticipant) => {
    const current = participantsByRoom.value[roomId] ?? [];
    if (current.some(({ id }) => id === participant.id)) return;
    participantsByRoom.value = { ...participantsByRoom.value, [roomId]: [...current, participant] };
  };

  const leaveVoice = (roomId: string, id: string) => {
    const current = participantsByRoom.value[roomId];
    if (!current) return;
    participantsByRoom.value = { ...participantsByRoom.value, [roomId]: current.filter((p) => p.id !== id) };
  };

  const setMute = (roomId: string, id: string, isMuted: boolean) => {
    const current = participantsByRoom.value[roomId];
    if (!current) return;
    participantsByRoom.value = {
      ...participantsByRoom.value,
      [roomId]: current.map((p) => (p.id === id ? { ...p, isMuted } : p)),
    };
  };

  const setParticipants = (roomId: string, participants: VoiceParticipant[]) => {
    participantsByRoom.value = { ...participantsByRoom.value, [roomId]: participants };
  };

  const addSpeakingUser = (id: string) => {
    if (speakingUserIds.value.includes(id)) return;
    speakingUserIds.value = [...speakingUserIds.value, id];
  };

  const removeSpeakingUser = (id: string) => {
    speakingUserIds.value = speakingUserIds.value.filter((speakingId) => speakingId !== id);
  };

  const clearSpeakingUsers = () => {
    speakingUserIds.value = [];
  };

  return {
    addSpeakingUser,
    clearSpeakingUsers,
    joinVoice,
    leaveVoice,
    participantsByRoom,
    removeSpeakingUser,
    setMute,
    setParticipants,
    speakingUserIds,
  };
});
