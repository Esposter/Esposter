import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { callRoomParticipantMap } from "@@/server/services/message/call/callParticipantMap";

export const createCallParticipant = (roomId: string, participant: CallParticipant): void => {
  let participantMap = callRoomParticipantMap.get(roomId);
  if (!participantMap) {
    participantMap = new Map<string, CallParticipant>();
    callRoomParticipantMap.set(roomId, participantMap);
  }
  participantMap.set(participant.id, participant);
};
