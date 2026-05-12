// Tracks when the first participant joined a call per session.
// Ephemeral — lost on server restart (same as callSessionParticipantMap).
export const callStartTimeMap = new Map<string, Date>();
