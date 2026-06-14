import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

export interface JoinCallOutput {
  callSessionId: string;
  livekitToken: string;
  livekitUrl: string;
  participantMap: Map<string, CallParticipant>;
}
