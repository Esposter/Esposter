import type { CallAccess } from "#src/models/message/call/CallAccess";
import type { CallJoin } from "#src/models/message/call/CallJoin";
import type { CallLeave } from "#src/models/message/call/CallLeave";
import type { CallParticipant } from "#src/models/message/call/CallParticipant";
import type { PublishSource } from "#src/models/message/call/PublishSource";

// The RPC surface of a CallObject, the one contract its class in the functions Worker and the web Worker's stubs share.
// Every method trusts the actor it names: the caller authorises against D1 first, and a method that checks the call's own
// state (admission, joined, knocking) says so by its return value rather than throwing
export interface CallObjectRpc {
  // Refused, as null, when a join needs an admission and the connection has none
  joinCall(input: {
    callSessionId: string;
    isAdmissionRequired: boolean;
    participant: CallParticipant;
  }): Promise<CallJoin | null>;
  leaveCall(input: { callSessionId: string; sessionId: string }): CallLeave | null;
  // The departures of every connection a user holds in the call, each kicked at RealtimeKit as it leaves
  evictUser(input: { callSessionId: string; userId: string }): Promise<CallLeave[]>;
  participantJoined(input: { callSessionId: string; participant: CallParticipant }): void;
  // Null while a revoke is replacing the connection, so its kick is not taken for the participant leaving
  participantLeft(input: { callSessionId: string; sessionId: string }): CallLeave | null;
  removeConnection(input: { sessionId: string }): Promise<void>;
  // A revoked session's sockets on this call, closed, and its connections left as a leave would
  closeSession(sessionId: string): Promise<void>;
  readAccess(input: { sessionId: string }): CallAccess;
  readParticipantMap(): Map<string, CallParticipant>;
  admitKnocker(input: { callSessionId: string; knockerSessionId: string }): boolean;
  dismissKnocker(input: { callSessionId: string; knockerSessionId: string }): boolean;
  knockCall(input: { callSessionId: string; doorkeeperUserId: string; knocker: CallParticipant }): void;
  setCameraEnabled(input: { callSessionId: string; isCameraEnabled: boolean; sessionId: string }): boolean;
  setHandRaised(input: { callSessionId: string; isHandRaised: boolean; sessionId: string }): boolean;
  setMuted(input: { callSessionId: string; isMuted: boolean; sessionId: string }): boolean;
  // Grants or revokes publishing for every connection a user holds; a revoke that narrows it replaces each connection
  updatePresets(input: {
    callSessionId: string;
    isGranted: boolean;
    sources: PublishSource[];
    userId: string;
  }): Promise<void>;
}
