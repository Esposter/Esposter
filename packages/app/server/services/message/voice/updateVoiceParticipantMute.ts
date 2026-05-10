import { voiceRoomParticipantMap } from "@@/server/services/message/voice/voiceParticipantMap";

export const updateVoiceParticipantMute = (roomId: string, id: string, isMuted: boolean): boolean => {
  const participantMap = voiceRoomParticipantMap.get(roomId);
  if (!participantMap) return false;

  const participant = participantMap.get(id);
  if (!participant) return false;

  participantMap.set(id, { ...participant, isMuted });
  return true;
};
