import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

export interface JoinCallResult {
  callSessionId: string;
  liveKitToken: string;
  liveKitUrl: string;
  participantMap: Map<string, CallParticipant>;
}
