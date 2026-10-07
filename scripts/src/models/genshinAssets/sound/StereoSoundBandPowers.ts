// Two channels' powers in each band of `SOUND_EFFECT_BAND_EDGES`, frame by frame, as three noises apart: the power both
// Channels share and each channel's own beside it
export interface StereoSoundBandPowers {
  left: number[][];
  right: number[][];
  shared: number[][];
}
