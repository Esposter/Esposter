import type { SoundEffectScore } from "#src/models/genshinParity/sound/SoundEffectScore";

import { SOUND_POWER_FLOOR } from "#src/services/genshinParity/shared/constants";
import { toDecibels } from "#src/services/genshinParity/shared/toDecibels";
import { computeChannelLevels } from "#src/services/genshinParity/sound/computeChannelLevels";
import { computeCorrelation } from "#src/services/genshinParity/sound/computeCorrelation";
import { SOUND_SCORE_RANGE_DECIBELS } from "#src/services/genshinParity/sound/constants";

// A sound effect as the engine renders it (`computeSoundEffectSamples`) against the game's sound it was fitted from, or
// Against another render of its own, both channels, in its own bands every `SOUND_SCORE_HOP_LENGTH`: finer than the
// Fit's frames, so a level the frames smooth over shows. Only the cells within `SOUND_SCORE_RANGE_DECIBELS` of the
// Game's loudest count, where the sound is heard over its own tail
export const scoreSoundEffect = (
  ours: readonly [Float32Array, Float32Array],
  game: readonly [Float32Array, Float32Array],
): SoundEffectScore => {
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
        const gap = (ourLevels[channel]?.[frame]?.[band] ?? toDecibels(0, SOUND_POWER_FLOOR)) - level;
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
