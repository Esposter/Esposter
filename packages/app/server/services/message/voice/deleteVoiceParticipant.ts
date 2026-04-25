import { voiceRoomParticipantMap } from "@@/server/services/message/voice/voiceParticipantMap";

export const deleteVoiceParticipant = (roomId: string, id: string): boolean => {
  const participantMap = voiceRoomParticipantMap.get(roomId);
  if (!participantMap) return false;

  const deletedParticipant = participantMap.delete(id);
  if (participantMap.size === 0) voiceRoomParticipantMap.delete(roomId);
  return deletedParticipant;
};
