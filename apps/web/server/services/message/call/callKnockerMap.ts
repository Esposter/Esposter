import type { CallParticipant } from "@esposter/db-schema";

// Per callSessionId, each knocker's sessionId to its CallParticipant
export const callKnockerMap = new Map<string, Map<string, CallParticipant>>();
