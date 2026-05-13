import { callSessionParticipantMap } from "@@/server/services/message/call/callParticipantMap";

export const deleteCallParticipant = (callSessionId: string, id: string): boolean => {
  const participantMap = callSessionParticipantMap.get(callSessionId);
  if (!participantMap) return false;

  const deletedParticipant = participantMap.delete(id);
  if (participantMap.size === 0) callSessionParticipantMap.delete(callSessionId);
  return deletedParticipant;
};
