// How close a render of music sounds to the game's: the mean agreement of their pitch classes, 1 identical, the mean
// Gap between their levels in decibels for each octave band and over all of them, 0 identical, and each band's mean
// Signed gap, ours over the game's, under 0 where ours is the quieter
export interface MusicScore {
  bandBiases: number[];
  bandDistances: number[];
  distance: number;
  pitchAgreement: number;
}
