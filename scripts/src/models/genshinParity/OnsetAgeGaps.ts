// The frames a score reads whose time since the last note began lies in one span: their share of those frames, and each
// Octave band's mean gap over them in decibels, ours over the game's, under 0 where ours is the quieter
export interface OnsetAgeGaps {
  bandGaps: number[];
  share: number;
}
