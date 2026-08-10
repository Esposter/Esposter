// Tracks when the first participant joined a call per session. Ephemeral, like every map beside it.
// Its own map rather than a field of the session record the other three form, because it is read by the last
// Leaver *after* deleteCallParticipant has already torn that record down — the duration is the one thing the
// End of a call still needs from its start (see /docs/esbabbler/calls)
export const callStartTimeMap = new Map<string, Date>();
