import type { CallParticipantRow } from "#src/models/message/call/CallParticipantRow";

// A connection's departure from a call. The duration is set only when that departure left the call empty, and is the
// Call's length in seconds, which the caller writes into the room as the call's summary. The participant is the
// Tombstone The departure left, which the leaving client applies as its own leave
export interface CallLeave {
  callDurationSeconds: null | number;
  participant: CallParticipantRow;
  sessionId: string;
  userId: string;
}
