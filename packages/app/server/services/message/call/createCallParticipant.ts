import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { callRoomParticipantMap } from "@@/server/services/message/call/callParticipantMap";

export const createCallParticipant = (roomId: string, participant: CallParticipant): void => {
  const participantMap = callRoomParticipantMap.get(roomId) ?? new Map<string, CallParticipant>();
  participantMap.set(participant.id, participant);
  callRoomParticipantMap.set(roomId, participantMap);
};
