import type { MusicSampleRange } from "#src/models/audio/MusicSampleRange";

// One recorded note a voice plays over its synthesized one: its file, by name within where the piece's recordings are
// Served, the MIDI pitch it was recorded at, its tuning in cents and its gain in decibels, as its library's mapping
// Gives them, with the keys and velocities it answers
export interface MusicRecording extends MusicSampleRange {
  file: string;
  gain: number;
  keyCenter: number;
  tune: number;
}
