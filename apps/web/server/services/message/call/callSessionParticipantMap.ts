import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

// Per callSessionId, each participantId to its CallParticipant
export const callSessionParticipantMap = new Map<string, Map<string, CallParticipant>>();
