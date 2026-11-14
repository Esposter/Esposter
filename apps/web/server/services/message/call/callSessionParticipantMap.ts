import type { CallParticipant } from "@esposter/db-schema";

// Per callSessionId, each participantId to its CallParticipant
export const callSessionParticipantMap = new Map<string, Map<string, CallParticipant>>();
