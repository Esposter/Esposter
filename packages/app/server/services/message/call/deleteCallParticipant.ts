import { callAdmittedParticipantMap } from "@@/server/services/message/call/callAdmittedParticipantMap";
import { callSessionParticipantMap } from "@@/server/services/message/call/callParticipantMap";
import { dismissCallKnockers } from "@@/server/services/message/call/dismissCallKnockers";

export const deleteCallParticipant = (callSessionId: string, id: string): boolean => {
  const participantMap = callSessionParticipantMap.get(callSessionId);
  if (!participantMap) return false;

  const isDeleted = participantMap.delete(id);
  if (participantMap.size === 0) {
    callSessionParticipantMap.delete(callSessionId);
    dismissCallKnockers(callSessionId);
    callAdmittedParticipantMap.delete(callSessionId);
  }
  return isDeleted;
};
