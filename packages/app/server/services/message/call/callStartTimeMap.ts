// Tracks when the first participant joined a call per room.
// Ephemeral — lost on server restart (same as callRoomParticipantMap).
export const callStartTimeMap = new Map<string, Date>();
