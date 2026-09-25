import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

export interface JoinCallResult {
  callSessionId: string;
  // Whether this participant decides who gets in, which is what lets the client open the knock stream only where
  // `requireCallDoorkeeper` would admit it — a standalone call's creator; a room call admits by membership instead
  isDoorkeeper: boolean;
  liveKitToken: string;
  liveKitUrl: string;
  participantMap: Map<string, CallParticipant>;
}
