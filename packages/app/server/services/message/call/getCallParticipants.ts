import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { callRoomParticipantMap } from "@@/server/services/message/call/callParticipantMap";

export const getCallParticipants = (roomId: string): CallParticipant[] => {
  const participantMap = callRoomParticipantMap.get(roomId);
  return participantMap ? [...participantMap.values()] : [];
};
