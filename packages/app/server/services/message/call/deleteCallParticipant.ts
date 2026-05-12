import { callRoomParticipantMap } from "@@/server/services/message/call/callParticipantMap";

export const deleteCallParticipant = (roomId: string, id: string): boolean => {
  const participantMap = callRoomParticipantMap.get(roomId);
  if (!participantMap) return false;

  const deletedParticipant = participantMap.delete(id);
  if (participantMap.size === 0) callRoomParticipantMap.delete(roomId);
  return deletedParticipant;
};
