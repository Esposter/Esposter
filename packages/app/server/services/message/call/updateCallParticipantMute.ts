import { callRoomParticipantMap } from "@@/server/services/message/call/callParticipantMap";

export const updateCallParticipantMute = (roomId: string, id: string, isMuted: boolean): boolean => {
  const participantMap = callRoomParticipantMap.get(roomId);
  if (!participantMap) return false;

  const participant = participantMap.get(id);
  if (!participant) return false;

  participantMap.set(id, { ...participant, isMuted });
  return true;
};
