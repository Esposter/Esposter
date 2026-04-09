// Tracks when the first participant joined a voice channel per room.
// Used to compute call duration for VoiceCallEnd system messages.
// Ephemeral — lost on server restart (same as voiceRoomParticipantMap).
export const voiceCallStartTimeMap = new Map<string, Date>();
