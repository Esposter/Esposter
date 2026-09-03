import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { callSessionParticipantMap } from "@@/server/services/message/call/callSessionParticipantMap";

// Returns the session's participant map, so a caller that needs it back does not re-read a map this just
// Guaranteed exists — and so nothing has to invent a fallback for a lookup that cannot miss
export const createCallParticipant = (
  callSessionId: string,
  participant: CallParticipant,
): Map<string, CallParticipant> => {
  let participantMap = callSessionParticipantMap.get(callSessionId);
  if (!participantMap) {
    participantMap = new Map<string, CallParticipant>();
    callSessionParticipantMap.set(callSessionId, participantMap);
  }
  participantMap.set(participant.id, participant);
  return participantMap;
};
