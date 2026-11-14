import { callAdmittedParticipantMap } from "#server/services/message/call/callAdmittedParticipantMap";
import { callKnockerMap } from "#server/services/message/call/callKnockerMap";
import { callSessionParticipantMap } from "#server/services/message/call/callSessionParticipantMap";
import { callEventEmitter } from "#server/services/message/events/callEventEmitter";
import { realtimeKitParticipantMap } from "#server/services/realtimeKit/realtimeKitParticipantMap";

export const deleteCallParticipant = (callSessionId: string, id: string): boolean => {
  const participantMap = callSessionParticipantMap.get(callSessionId);
  if (!participantMap) return false;

  const isDeleted = participantMap.delete(id);
  realtimeKitParticipantMap.get(callSessionId)?.delete(id);
  if (participantMap.size === 0) {
    callSessionParticipantMap.delete(callSessionId);
    realtimeKitParticipantMap.delete(callSessionId);
    const knockerMap = callKnockerMap.get(callSessionId);
    if (knockerMap) {
      for (const knockerSessionId of knockerMap.keys())
        callEventEmitter.emit("knockerDismissed", { callSessionId, knockerSessionId });
      callKnockerMap.delete(callSessionId);
    }
    callAdmittedParticipantMap.delete(callSessionId);
  }
  return isDeleted;
};
