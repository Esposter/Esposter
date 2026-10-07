import type { SoundEffectScore } from "#src/models/genshinParity/sound/SoundEffectScore";
import type { SoundEffect } from "genshin-engine";

import { SOUND_SAMPLE_RATE } from "#src/services/genshinAssets/shared/constants";
import { computeStereoSoundBandPowers } from "#src/services/genshinAssets/sound/computeStereoSoundBandPowers";
import { SOUND_SCORE_HOP_LENGTH, SOUND_SCORE_RANGE_DECIBELS } from "#src/services/genshinParity/shared/constants";
import { computeSoundEffectSamples } from "genshin-engine";

const toDecibels = (power: number): number => 10 * Math.log10(Math.max(power, Number.MIN_VALUE));
// Each channel's level in each band frame by frame, its own power and the shared one's together
const computeChannelLevels = (left: Float32Array, right: Float32Array): number[][][] => {
  const powers = computeStereoSoundBandPowers(left, right, SOUND_SCORE_HOP_LENGTH);
  return [powers.left, powers.right].map((frames) =>
    frames.map((bands, frame) => bands.map((power, band) => toDecibels(power + (powers.shared[frame]?.[band] ?? 0)))),
  );
};
const computeCorrelation = (left: Float32Array, right: Float32Array): number => {
  let product = 0;
  let leftPower = 0;
  let rightPower = 0;
  for (const [index, sample] of left.entries()) {
    const other = right[index] ?? 0;
    product += sample * other;
    leftPower += sample * sample;
    rightPower += other * other;
  }
  return product / Math.sqrt(leftPower * rightPower);
};
// A sound effect rendered by the engine (`computeSoundEffectSamples`) against the game's sound it was fitted from, both
// Channels, in its own bands every `SOUND_SCORE_HOP_LENGTH`: finer than the fit's frames, so a level the frames
// Smooth over shows. Only the cells within `SOUND_SCORE_RANGE_DECIBELS` of the game's loudest count, where the sound is
// Heard over its own tail
export const scoreSoundEffect = (
  effect: SoundEffect,
  game: readonly [Float32Array, Float32Array],
): SoundEffectScore => {
  const ours = computeSoundEffectSamples(effect, SOUND_SAMPLE_RATE);
  const gameLevels = computeChannelLevels(...game);
  const ourLevels = computeChannelLevels(...ours);
  const loudest = Math.max(...gameLevels.flatMap((frames) => frames.flat()));
  const bandGaps: number[][] = [];
  let total = 0;
  let count = 0;
  for (const [channel, frames] of gameLevels.entries())
    for (const [frame, bands] of frames.entries())
      for (const [band, level] of bands.entries()) {
        if (level < loudest - SOUND_SCORE_RANGE_DECIBELS) continue;
        const gap = (ourLevels[channel]?.[frame]?.[band] ?? toDecibels(0)) - level;
        total += Math.abs(gap);
        count++;
        (bandGaps[band] ??= []).push(gap);
      }
  return {
    bandBiases: Array.from(
      bandGaps,
      (gaps: number[] | undefined = []) => gaps.reduce((sum, gap) => sum + gap, 0) / Math.max(gaps.length, 1),
    ),
    correlation: { game: computeCorrelation(...game), ours: computeCorrelation(...ours) },
    distance: total / Math.max(count, 1),
  };
};
