import type { CallAccess } from "#src/models/message/call/CallAccess";
import type { CallJoin } from "#src/models/message/call/CallJoin";
import type { CallLeave } from "#src/models/message/call/CallLeave";
import type { CallParticipantProfile } from "#src/models/message/call/CallParticipant";
import type { CallParticipantRow } from "#src/models/message/call/CallParticipantRow";
import type { PublishSource } from "#src/models/message/call/PublishSource";

// The RPC surface of a CallObject, the one contract its class in the realtime Worker and the web Worker's stubs share.
// Every method trusts the actor it names: the caller authorises against D1 first, and a method that checks the call's
// Own state (admission, joined, knocking) says so by its return value rather than throwing
export interface CallObjectRpc {
  // The knocker's row as a tombstone at the version the removal left it, or the tombstone it already had.
  // Null when the call never held the knocker
  admitKnocker: (input: { callSessionId: string; knockerId: string }) => CallParticipantRow | null;
  // A revoked session's sockets on this call, closed, and its connections left as a leave would, with that leave
  closeSession: (sessionId: string) => Promise<CallLeave | null>;
  dismissKnocker: (input: { callSessionId: string; knockerId: string }) => CallParticipantRow | null;
  // The departures of every connection a user holds in the call, each kicked at RealtimeKit as it leaves
  evictUser: (input: { callSessionId: string; userId: string }) => Promise<CallLeave[]>;
  // Refused, as null, when a join needs an admission and the connection has none
  joinCall: (input: {
    callSessionId: string;
    isAdmissionRequired: boolean;
    participant: CallParticipantProfile;
    sessionId: string;
  }) => Promise<CallJoin | null>;
  knockCall: (input: {
    callSessionId: string;
    doorkeeperUserId: string;
    knocker: CallParticipantProfile;
    sessionId: string;
  }) => void;
  leaveCall: (input: { callSessionId: string; sessionId: string }) => CallLeave | null;
  // Null while a revoke is replacing the connection, so its kick is not taken for the participant leaving
  participantLeft: (input: { callSessionId: string; leftAt: Date; participantId: string }) => CallLeave | null;
  readAccess: (input: { sessionId: string }) => CallAccess;
  // Every row the call holds, tombstones included, so a read that answered before a leave loses to the leave's row
  readParticipantMap: () => Map<string, CallParticipantRow>;
  // The user a participant is a connection of, empty when the call holds no such participant
  readParticipantUserId: (input: { participantId: string }) => string;
  removeConnection: (input: { participantId: string }) => Promise<void>;
  // The row a flag change wrote, at the version it left it, or null when the call holds no live participant for it
  setCameraEnabled: (input: {
    callSessionId: string;
    isCameraEnabled: boolean;
    sessionId: string;
  }) => CallParticipantRow | null;
  setHandRaised: (input: {
    callSessionId: string;
    isHandRaised: boolean;
    participantId: string;
  }) => CallParticipantRow | null;
  setMuted: (input: { callSessionId: string; isMuted: boolean; sessionId: string }) => CallParticipantRow | null;
  // Grants or revokes publishing for every connection a user holds; a revoke that narrows it replaces each connection
  updatePresets: (input: {
    callSessionId: string;
    isGranted: boolean;
    sources: PublishSource[];
    userId: string;
  }) => Promise<void>;
}
