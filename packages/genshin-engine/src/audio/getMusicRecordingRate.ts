import type { MusicRecording } from "#src/models/audio/MusicRecording";

// How much faster a recording is read to sound a pitch: shifted from the pitch it was recorded at, with its mapping's
// Tune in cents and the voice's `tuning` in semitones correcting it, as an instrument tunes every pitch it plays
export const getMusicRecordingRate = (
  { keyCenter, tune }: Pick<MusicRecording, "keyCenter" | "tune">,
  pitch: number,
  tuning: number,
): number => 2 ** ((pitch - keyCenter + tuning) / 12 + tune / 1200);
