import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

// callSessionId -> sessionId -> CallParticipant
export const callKnockerMap = new Map<string, Map<string, CallParticipant>>();
