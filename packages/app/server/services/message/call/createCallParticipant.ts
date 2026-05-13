import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { callSessionParticipantMap } from "@@/server/services/message/call/callParticipantMap";

export const createCallParticipant = (callSessionId: string, participant: CallParticipant): void => {
  let participantMap = callSessionParticipantMap.get(callSessionId);
  if (!participantMap) {
    participantMap = new Map<string, CallParticipant>();
    callSessionParticipantMap.set(callSessionId, participantMap);
  }
  participantMap.set(participant.id, participant);
};
