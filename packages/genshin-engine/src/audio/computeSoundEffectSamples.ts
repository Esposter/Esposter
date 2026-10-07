import type { SoundEffect } from "#src/models/audio/SoundEffect";

import { SOUND_EFFECT_FRAME_LENGTH } from "#src/audio/constants";
import { getSoundEffectBandBins } from "#src/audio/getSoundEffectBandBins";
import { transformFourier } from "#src/audio/transformFourier";

// The noise plays in frames a quarter of a frame apart, where a Hann window's squares sum to one and a half
const HOP_SHARE = 4;
const WINDOW_SQUARES_PER_HOP = 1.5;
const window = Float64Array.from(
  { length: SOUND_EFFECT_FRAME_LENGTH },
  (_value, index) => 0.5 - 0.5 * Math.cos((2 * Math.PI * index) / SOUND_EFFECT_FRAME_LENGTH),
);
// One noise of a sound effect as samples: frame after frame of a spectrum flat across each band at the level the
// Effect's frames give it at that moment, read between two frames linearly, each bin's phase a hash of the frame, the
// Bin and `seed`, turned into samples by an inverse transform and laid over the frames before it under a Hann window.
// Frames apart hold noise of their own, so their powers add, and a bin's amplitude is set so the window's overlaps
// Leave each band at its level's variance
const computeSoundEffectNoise = (
  levels: number[][],
  frameSeconds: number,
  sampleRate: number,
  length: number,
  seed: number,
): Float32Array => {
  const hop = SOUND_EFFECT_FRAME_LENGTH / HOP_SHARE;
  const half = SOUND_EFFECT_FRAME_LENGTH / 2;
  const output = new Float32Array(length + SOUND_EFFECT_FRAME_LENGTH);
  const bandBins = getSoundEffectBandBins(sampleRate);
  const real = new Float64Array(SOUND_EFFECT_FRAME_LENGTH);
  const imaginary = new Float64Array(SOUND_EFFECT_FRAME_LENGTH);
  for (let start = -half; start < length; start += hop) {
    const position = (start + half) / sampleRate / frameSeconds;
    const frame = Math.floor(position);
    const share = position - frame;
    real.fill(0);
    imaginary.fill(0);
    for (const [band, [lowBin, highBin]] of bandBins.entries()) {
      const level =
        (levels[frame]?.[band] ?? 0) * (1 - share) +
        (levels[Math.min(frame + 1, levels.length - 1)]?.[band] ?? 0) * share;
      if (level <= 0) continue;
      // Each bin and its mirror hold twice its power, and the window's overlaps scale the frames' summed power
      const amplitude = level / Math.sqrt(2 * WINDOW_SQUARES_PER_HOP * (highBin - lowBin + 1));
      for (let bin = lowBin; bin <= highBin; bin++) {
        const hash = Math.sin(bin * 12.9898 + start * 0.000731 + seed * 78.233) * 43_758.5453;
        const phase = 2 * Math.PI * (hash - Math.floor(hash));
        real[bin] = amplitude * Math.cos(phase);
        real[SOUND_EFFECT_FRAME_LENGTH - bin] = amplitude * Math.cos(phase);
        imaginary[bin] = -amplitude * Math.sin(phase);
        imaginary[SOUND_EFFECT_FRAME_LENGTH - bin] = amplitude * Math.sin(phase);
      }
    }
    // A real signal's spectrum mirrors itself, conjugated; the inverse transform is the forward one of the conjugate
    transformFourier(real, imaginary);
    for (let index = 0; index < SOUND_EFFECT_FRAME_LENGTH; index++) {
      const sample = start + index;
      if (sample >= 0) output[sample] = (output[sample] ?? 0) + (real[index] ?? 0) * (window[index] ?? 0);
    }
  }
  return output.subarray(0, length);
};
// A sound effect as two channels of our own noise: the noise both share and each channel's own, every one built frame
// By frame from its levels (`computeSoundEffectNoise`) with a seed of its own so the three are apart, the shared noise
// Added to each channel's. Noises apart add their powers, so each channel's level is its own and the shared noise's
// Together, as the effect was measured
export const computeSoundEffectSamples = (
  { frameSeconds, leftLevels, rightLevels, sharedLevels }: SoundEffect,
  sampleRate: number,
): [Float32Array, Float32Array] => {
  const length = Math.ceil(sharedLevels.length * frameSeconds * sampleRate);
  const shared = computeSoundEffectNoise(sharedLevels, frameSeconds, sampleRate, length, 0);
  const left = computeSoundEffectNoise(leftLevels, frameSeconds, sampleRate, length, 1);
  const right = computeSoundEffectNoise(rightLevels, frameSeconds, sampleRate, length, 2);
  for (const [index, sample] of shared.entries()) {
    left[index] = (left[index] ?? 0) + sample;
    right[index] = (right[index] ?? 0) + sample;
  }
  return [left, right];
};
