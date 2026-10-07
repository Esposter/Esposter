import type { MusicRecording } from "#src/models/audio/MusicRecording";

// The gain a recording plays a note at: the note's velocity over the recording's own gain in decibels, which its
// Mapping gives since each recording is normalised alone, before the voice's level scales it
export const getMusicRecordingGain = ({ gain }: Pick<MusicRecording, "gain">, velocity: number): number =>
  velocity * 10 ** (gain / 20);
