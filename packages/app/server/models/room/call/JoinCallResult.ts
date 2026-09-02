import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

export interface JoinCallResult {
  callSessionId: string;
  livekitToken: string;
  livekitUrl: string;
  participantMap: Map<string, CallParticipant>;
}
