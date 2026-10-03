// How close a render of music sounds to the game's: the mean agreement of their pitch classes, 1 identical, and the
// Mean gap between their levels in decibels for each octave band and over all of them, 0 identical
export interface MusicScore {
  bandDistances: number[];
  distance: number;
  pitchAgreement: number;
}
