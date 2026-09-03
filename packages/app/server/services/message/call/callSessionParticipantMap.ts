import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

// CallSessionId -> participantId -> CallParticipant
export const callSessionParticipantMap = new Map<string, Map<string, CallParticipant>>();
