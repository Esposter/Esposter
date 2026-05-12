import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
// RoomId -> participantId -> CallParticipant
export const callRoomParticipantMap = new Map<string, Map<string, CallParticipant>>();
