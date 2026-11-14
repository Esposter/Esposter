import type { CallParticipant } from "@esposter/db-schema";

export interface JoinCallResult {
  // The participant's RealtimeKit auth token, which the client hands to its meeting; empty when RealtimeKit is not configured
  authToken: string;
  callSessionId: string;
  // Whether this participant decides who gets in, which is what lets the client open the knock stream only where
  // `requireCallDoorkeeper` would admit it — a standalone call's creator; a room call admits by membership instead
  isDoorkeeper: boolean;
  // The RealtimeKit meeting this call's participants join, empty when RealtimeKit is not configured
  meetingId: string;
  participantMap: Map<string, CallParticipant>;
}
