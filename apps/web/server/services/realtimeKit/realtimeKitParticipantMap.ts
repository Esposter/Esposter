import type { RealtimeKitParticipant } from "#server/models/realtimeKit/RealtimeKitParticipant";

// Per callSessionId, each participantId to the RealtimeKit participant it was added as. It sits beside the call's
// participant map and is removed with it, and like that map it is lost on restart, which leaves no connection to moderate
export const realtimeKitParticipantMap = new Map<string, Map<string, RealtimeKitParticipant>>();
