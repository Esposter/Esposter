import type { CallParticipant } from "#src/models/message/call/CallParticipant";

// What a join hands back: the RealtimeKit token and meeting its client joins with, and the call as it stands
export interface CallJoin {
  // Empty when RealtimeKit is not configured, so the call is joined with no media server
  authToken: string;
  // Whether this join started the call, which is what the caller announces in the room
  isFirstJoiner: boolean;
  // Empty when RealtimeKit is not configured
  meetingId: string;
  participantMap: Map<string, CallParticipant>;
}
