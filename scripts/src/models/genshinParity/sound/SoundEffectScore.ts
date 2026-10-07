// A sound effect of ours against the game's own: each channel's mean gap in decibels over its bands and finer frames,
// Each band's gap signed, ours over the game's, and how alike the two channels sound in each, from -1 to 1
export interface SoundEffectScore {
  bandBiases: number[];
  correlation: { game: number; ours: number };
  distance: number;
}
