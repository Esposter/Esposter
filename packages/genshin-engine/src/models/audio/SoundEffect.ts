// A sound with no pitch, a burst or a rumble, as its noise's level in each octave band of `MUSIC_NOISE_BAND_CENTRES`
// Over time: each frame's standard deviation a band, the frames this many seconds apart
export interface SoundEffect {
  frameSeconds: number;
  levels: number[][];
}
