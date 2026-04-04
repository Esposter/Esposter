import type { VoiceParticipant } from "#shared/models/room/voice/VoiceParticipant";

export const useVoiceStore = defineStore("message/voice", () => {
  const participantsByRoom = ref<Record<string, VoiceParticipant[]>>({});

  const storeJoinVoice = (roomId: string, participant: VoiceParticipant) => {
    const current = participantsByRoom.value[roomId] ?? [];
    if (current.some(({ id }) => id === participant.id)) return;
    participantsByRoom.value = { ...participantsByRoom.value, [roomId]: [...current, participant] };
  };

  const storeLeaveVoice = (roomId: string, id: string) => {
    const current = participantsByRoom.value[roomId];
    if (!current) return;
    participantsByRoom.value = { ...participantsByRoom.value, [roomId]: current.filter((p) => p.id !== id) };
  };

  const storeSetMute = (roomId: string, id: string, isMuted: boolean) => {
    const current = participantsByRoom.value[roomId];
    if (!current) return;
    participantsByRoom.value = {
      ...participantsByRoom.value,
      [roomId]: current.map((p) => (p.id === id ? { ...p, isMuted } : p)),
    };
  };

  const storeSetParticipants = (roomId: string, participants: VoiceParticipant[]) => {
    participantsByRoom.value = { ...participantsByRoom.value, [roomId]: participants };
  };

  return { participantsByRoom, storeJoinVoice, storeLeaveVoice, storeSetMute, storeSetParticipants };
});
