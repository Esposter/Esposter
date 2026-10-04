import type { MusicSampleRange } from "genshin-engine";

// One recorded note of a sampled instrument as its SFZ mapping plays it: the file, relative to the library's root, the
// Pitch it was recorded at, its tuning in cents and gain in decibels, and the frame its sound starts from
export interface SampleRegion extends MusicSampleRange {
  gain: number;
  keyCenter: number;
  offset: number;
  path: string;
  tune: number;
}
