// Tracks when the first participant joined a voice channel per room.
// Ephemeral — lost on server restart (same as voiceRoomParticipantMap).
export const voiceCallStartTimeMap = new Map<string, Date>();
