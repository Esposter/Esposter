// A connection's departure from a call. The duration is set only when that departure left the call empty, and is the
// call's length in seconds, which the caller writes into the room as the call's summary
export interface CallLeave {
  callDurationSeconds: number | null;
  sessionId: string;
  userId: string;
}
