import type { StereoSoundBandPowers } from "#src/models/genshinAssets/sound/StereoSoundBandPowers";

import { SOUND_HOP_LENGTH, SOUND_SAMPLE_RATE } from "#src/services/genshinAssets/shared/constants";
import { getSoundEffectBandBins, SOUND_EFFECT_FRAME_LENGTH, transformFourier } from "genshin-engine";

// A Hann window's power over its samples, three eighths, and a real signal's spectrum mirrored
const POWER_SCALE = 2 / (SOUND_EFFECT_FRAME_LENGTH * SOUND_EFFECT_FRAME_LENGTH * (3 / 8));
const window = Float64Array.from(
  { length: SOUND_EFFECT_FRAME_LENGTH },
  (_value, index) => 0.5 - 0.5 * Math.cos((2 * Math.PI * index) / SOUND_EFFECT_FRAME_LENGTH),
);
// One channel's spectrum in one frame, its window centred on the frame by leading the sound with half a window
const transformFrame = (samples: Float32Array, start: number): [Float64Array, Float64Array] => {
  const real = new Float64Array(SOUND_EFFECT_FRAME_LENGTH);
  const imaginary = new Float64Array(SOUND_EFFECT_FRAME_LENGTH);
  for (let index = 0; index < SOUND_EFFECT_FRAME_LENGTH; index++)
    real[index] = (samples[start + index] ?? 0) * (window[index] ?? 0);
  transformFourier(real, imaginary);
  return [real, imaginary];
};
// Two channels' powers in each band of `SOUND_EFFECT_BAND_EDGES` every `hopLength` samples, a Hann window's band of bins
// Over the window's own power so a power is its noise's variance, split as the engine plays them
// (`computeSoundEffectSamples`): the channels' cross power is what they share, no less than none and no more than
// Either channel holds, and each channel's own is the rest of its power. So each channel's power and how alike the two
// Are both survive, which one channel's average of the two keeps neither of
export const computeStereoSoundBandPowers = (
  left: Float32Array,
  right: Float32Array,
  hopLength: number = SOUND_HOP_LENGTH,
): StereoSoundBandPowers => {
  const bandBins = getSoundEffectBandBins(SOUND_SAMPLE_RATE);
  const frameCount = Math.ceil(Math.max(left.length, right.length) / hopLength) + 1;
  const powers: StereoSoundBandPowers = { left: [], right: [], shared: [] };
  for (let frame = 0; frame < frameCount; frame++) {
    const start = frame * hopLength - SOUND_EFFECT_FRAME_LENGTH / 2;
    const [leftReal, leftImaginary] = transformFrame(left, start);
    const [rightReal, rightImaginary] = transformFrame(right, start);
    const leftBands: number[] = [];
    const rightBands: number[] = [];
    const sharedBands: number[] = [];
    for (const [lowBin, highBin] of bandBins) {
      let leftPower = 0;
      let rightPower = 0;
      let crossPower = 0;
      for (let bin = lowBin; bin <= highBin; bin++) {
        const [lr, li, rr, ri] = [
          leftReal[bin] ?? 0,
          leftImaginary[bin] ?? 0,
          rightReal[bin] ?? 0,
          rightImaginary[bin] ?? 0,
        ];
        leftPower += lr * lr + li * li;
        rightPower += rr * rr + ri * ri;
        crossPower += lr * rr + li * ri;
      }
      const shared = Math.min(Math.max(crossPower, 0), leftPower, rightPower);
      leftBands.push((leftPower - shared) * POWER_SCALE);
      rightBands.push((rightPower - shared) * POWER_SCALE);
      sharedBands.push(shared * POWER_SCALE);
    }
    powers.left.push(leftBands);
    powers.right.push(rightBands);
    powers.shared.push(sharedBands);
  }
  return powers;
};
