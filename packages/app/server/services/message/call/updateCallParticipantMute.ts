import { callSessionParticipantMap } from "@@/server/services/message/call/callParticipantMap";

export const updateCallParticipantMute = (callSessionId: string, id: string, isMuted: boolean): boolean => {
  const participantMap = callSessionParticipantMap.get(callSessionId);
  if (!participantMap) return false;

  const participant = participantMap.get(id);
  if (!participant) return false;

  participantMap.set(id, { ...participant, isMuted });
  return true;
};
