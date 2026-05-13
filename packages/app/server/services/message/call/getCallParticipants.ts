import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { callSessionParticipantMap } from "@@/server/services/message/call/callParticipantMap";

export const getCallParticipants = (callSessionId: string): CallParticipant[] => {
  const participantMap = callSessionParticipantMap.get(callSessionId);
  return participantMap ? [...participantMap.values()] : [];
};
