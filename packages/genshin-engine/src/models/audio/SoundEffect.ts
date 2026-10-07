// A sound with no pitch, a burst or a rumble, in two channels as three noises in each band of
// `SOUND_EFFECT_BAND_EDGES` over time: one both channels share and one each channel holds alone, so each channel's
// Level and how alike the two sound are both follow the sound measured. Each frame gives every band's standard
// Deviation, the frames this many seconds apart
export interface SoundEffect {
  frameSeconds: number;
  leftLevels: number[][];
  rightLevels: number[][];
  sharedLevels: number[][];
}
