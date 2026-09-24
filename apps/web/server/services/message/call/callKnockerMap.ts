import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

// Per callSessionId, each knocker's sessionId to its CallParticipant
export const callKnockerMap = new Map<string, Map<string, CallParticipant>>();
