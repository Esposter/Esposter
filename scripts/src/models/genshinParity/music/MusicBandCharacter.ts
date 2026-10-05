// What one octave band of a piece of music holds, over the frames its sound is not quiet in: its share of the whole
// Sound's power in decibels, its median spectral flatness (near 0 for partials, near 1 for noise), how much more power
// It holds at the notes' attacks than between them in decibels, and the share of its power within half a semitone of
// A partial of a note sounding in that frame, low where the band holds what no note plays
export interface MusicBandCharacter {
  attackWeight: number;
  flatness: number;
  partialShare: number;
  share: number;
}
